module voting_system::survey;

use std::string::String;
use sui::tx_context::{sender};
use sui::event;
use voting_system::badge::{Self, SurveyCreatorBadge};

// Error codes
const E_SURVEY_CLOSED: u64 = 0;
const E_INVALID_OPTION_INDEX: u64 = 2;
const E_NOT_OWNER: u64 = 3;
const E_LENGTH_MISMATCH: u64 = 4;
const E_TOO_MANY_SELECTIONS: u64 = 5;
const E_SURVEY_ALREADY_CLOSED: u64 = 6;
const E_INVALID_MAX_SELECTIONS: u64 = 7;
const E_SURVEY_LIMIT_REACHED: u64 = 8;
const E_NO_BADGE: u64 = 9;  // ← YENİ

const MAX_FREE_SURVEYS: u64 = 3;

public struct Survey has key,store {
    id: UID,
    title: String,
    description: String,
    owner: address,
    is_open: bool,
    questions: vector<Question>,
    participant_count: u64,  // ← YENİ: Katılımcı sayısı
    created_at: u64,  // ← YENİ
}

public struct Question has store {
    prompt: String,
    options: vector<String>,
    allows_multiple: bool,
    max_selections: u8,
}

public struct Response has key {
    id: UID,
    survey_id: ID,
    responder: address,
    answers: vector<Answer>,
}

public struct Answer has store {
    question_index: u64,
    selected_option_indices: vector<u64>,
    free_text: Option<String>,
}

public struct UserSurveyLimit has key {
    id: UID,
    user_limits: sui::table::Table<address, u64>,
    user_responses: sui::table::Table<address, u64>,  // ← YENİ: Katılım sayısı
}

public struct SurveyCreated has copy, drop, store { survey: ID, owner: address }
public struct SurveyClosed has copy, drop, store { survey: ID }
public struct ResponseRecorded has copy, drop, store { 
    survey: ID, 
    responder: address,
    participant_count: u64  // ← YENİ
}

// ← YENİ: Milestone event
public struct MilestoneReached has copy, drop {
    survey: ID,
    owner: address,
    participant_count: u64,
    milestone: u64,
}

fun assert_open(s: &Survey) { assert!(s.is_open, E_SURVEY_CLOSED); }
fun assert_owner(s: &Survey, who: address) { assert!(s.owner == who, E_NOT_OWNER); }

fun validate_option_indices(selected: &vector<u64>, num_options: u64) {
    let mut j = 0u64;
    let len = vector::length(selected);
    while (j < len) {
        let idx = *vector::borrow(selected, j);
        assert!(idx < num_options, E_INVALID_OPTION_INDEX);
        j = j + 1;
    }
}

fun init(ctx: &mut TxContext) {
    let user_limit = UserSurveyLimit {
        id: object::new(ctx),
        user_limits: sui::table::new(ctx),
        user_responses: sui::table::new(ctx),  // ← YENİ
    };
    transfer::share_object(user_limit);
}

// ← DEĞİŞTİ: Bedava anket (max 3)
public fun create_survey(
    user_limit: &mut UserSurveyLimit,
    title: String,
    description: String,
    ctx: &mut TxContext
) {
    let creator = sender(ctx);
    
    let current_count = if (sui::table::contains(&user_limit.user_limits, creator)) {
        *sui::table::borrow(&user_limit.user_limits, creator)
    } else {
        0
    };

    assert!(current_count < MAX_FREE_SURVEYS, E_SURVEY_LIMIT_REACHED);

    let survey = Survey {
        id: object::new(ctx),
        title,
        description,
        owner: creator,
        is_open: true,
        questions: vector::empty<Question>(),
        participant_count: 0,  // ← YENİ
        created_at: ctx.epoch(),  // ← YENİ
    };
    let survey_id = object::id(&survey);

    if (sui::table::contains(&user_limit.user_limits, creator)) {
        let count = sui::table::borrow_mut(&mut user_limit.user_limits, creator);
        *count = *count + 1;
    } else {
        sui::table::add(&mut user_limit.user_limits, creator, 1);
    };

    event::emit(SurveyCreated { survey: survey_id, owner: creator });
    transfer::share_object(survey);
}

// ← YENİ: Badge ile 1 anket oluştur (badge yakılır!)
public fun create_survey_with_badge(
    badge: SurveyCreatorBadge,  // ← Ownership alıyor (yakılacak)
    title: String,
    description: String,
    ctx: &mut TxContext
) {
    assert!(badge::is_creator_badge(&badge), E_NO_BADGE);

    let survey = Survey {
        id: object::new(ctx),
        title,
        description,
        owner: sender(ctx),
        is_open: true,
        questions: vector::empty<Question>(),
        participant_count: 0,
        created_at: ctx.epoch(),
    };
    let survey_id = object::id(&survey);

    // Badge'i yak (1 badge = 1 anket)
    badge::burn_badge(badge);

    event::emit(SurveyCreated { survey: survey_id, owner: sender(ctx) });
    transfer::share_object(survey);
}

public fun add_question(
    survey: &mut Survey,
    prompt: String,
    options: vector<String>,
    allows_multiple: bool,
    max_selections: u8,
    ctx: &mut TxContext,
) {
    assert_owner(survey, sender(ctx));
    assert_open(survey);
    assert!(vector::length(&options) > 0, E_INVALID_OPTION_INDEX);
    if (allows_multiple) {
        assert!((max_selections as u64) <= vector::length(&options) && (max_selections as u64) >= 1, E_INVALID_MAX_SELECTIONS);
    } else {
        assert!(max_selections == 1, E_INVALID_MAX_SELECTIONS);
    };
    let q = Question { prompt, options, allows_multiple, max_selections };
    vector::push_back(&mut survey.questions, q);
}

public fun close_survey(
    survey: &mut Survey,
    ctx: &mut TxContext
) {
    assert_owner(survey, sender(ctx));
    assert!(survey.is_open, E_SURVEY_ALREADY_CLOSED);
    event::emit(SurveyClosed { survey: object::id(survey) });
    survey.is_open = false;
}

// ← DEĞİŞTİ: Katılım sayısı artırılıyor
public fun submit_response(
    survey: &mut Survey,  // ← mut oldu
    user_limit: &mut UserSurveyLimit,  // ← YENİ parametre
    selections: vector<vector<u64>>,
    free_texts: vector<Option<String>>,
    ctx: &mut TxContext
) {
    let mut selections_mut = selections;
    let mut free_texts_mut = free_texts;
    assert_open(survey);
    let q_len = vector::length(&survey.questions);
    assert!(vector::length(&selections_mut) == q_len, E_LENGTH_MISMATCH);
    assert!(vector::length(&free_texts_mut) == q_len, E_LENGTH_MISMATCH);

    let mut answers = vector::empty<Answer>();
    let mut i = 0u64;
    while (i < q_len) {
        let q_ref = vector::borrow(&survey.questions, i);
        let sel = vector::remove(&mut selections_mut, 0);
        let ft = vector::remove(&mut free_texts_mut, 0);

        let num_options = vector::length(&q_ref.options);
        let sel_len = vector::length(&sel);
        if (q_ref.allows_multiple) {
            assert!(sel_len <= (q_ref.max_selections as u64), E_TOO_MANY_SELECTIONS);
        } else {
            assert!(sel_len <= 1, E_TOO_MANY_SELECTIONS);
        };
        validate_option_indices(&sel, num_options);

        vector::push_back(&mut answers, Answer {
            question_index: i,
            selected_option_indices: sel,
            free_text: ft,
        });
        i = i + 1;
    };

    let responder = sender(ctx);

    // ← YENİ: Katılım sayısını artır
    survey.participant_count = survey.participant_count + 1;

    // ← YENİ: Kullanıcının katıldığı anket sayısını artır
    if (sui::table::contains(&user_limit.user_responses, responder)) {
        let count = sui::table::borrow_mut(&mut user_limit.user_responses, responder);
        *count = *count + 1;
    } else {
        sui::table::add(&mut user_limit.user_responses, responder, 1);
    };

    // ← YENİ: Milestone kontrolü (10, 50, 100 katılımcı)
    let milestones = vector[10u64, 50u64, 100u64];
    let mut j = 0;
    while (j < vector::length(&milestones)) {
        let milestone = *vector::borrow(&milestones, j);
        if (survey.participant_count == milestone) {
            event::emit(MilestoneReached {
                survey: object::id(survey),
                owner: survey.owner,
                participant_count: survey.participant_count,
                milestone,
            });
        };
        j = j + 1;
    };

    let response = Response {
        id: object::new(ctx),
        survey_id: object::id(survey),
        responder,
        answers,
    };
    
    event::emit(ResponseRecorded { 
        survey: object::id(survey), 
        responder,
        participant_count: survey.participant_count  // ← YENİ
    });
    
    transfer::transfer(response, responder);
}

// ← YENİ: Getters
public fun get_user_survey_count(user_limit: &UserSurveyLimit, user: address): u64 {
    if (sui::table::contains(&user_limit.user_limits, user)) {
        *sui::table::borrow(&user_limit.user_limits, user)
    } else {
        0
    }
}

public fun get_user_response_count(user_limit: &UserSurveyLimit, user: address): u64 {
    if (sui::table::contains(&user_limit.user_responses, user)) {
        *sui::table::borrow(&user_limit.user_responses, user)
    } else {
        0
    }
}

public fun get_survey_participant_count(survey: &Survey): u64 {
    survey.participant_count
}

public fun can_create_free_survey(user_limit: &UserSurveyLimit, user: address): bool {
    get_user_survey_count(user_limit, user) < MAX_FREE_SURVEYS
}

public fun get_remaining_free_surveys(user_limit: &UserSurveyLimit, user: address): u64 {
    let current = get_user_survey_count(user_limit, user);
    if (current >= MAX_FREE_SURVEYS) {
        0
    } else {
        MAX_FREE_SURVEYS - current
    }
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}

#[test_only]
public fun create_survey_for_testing(
    title: String,
    description: String,
    ctx: &mut TxContext
): Survey {
    Survey {
        id: object::new(ctx),
        title,
        description,
        owner: sender(ctx),
        is_open: true,
        questions: vector::empty<Question>(),
        participant_count: 0,
        created_at: 0,
    }
}

#[test_only]
public fun is_open_for_testing(s: &Survey): bool { s.is_open }

#[test_only]
public fun num_questions_for_testing(s: &Survey): u64 { vector::length(&s.questions) }

#[test_only]
public fun consume_for_testing(s: Survey) {
    transfer::public_share_object(s);
}