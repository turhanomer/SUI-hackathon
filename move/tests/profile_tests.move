#[test_only]
module voting_system::system_tests {
    use voting_system::survey::{Self, Survey, UserSurveyLimit};
    use voting_system::badge::{Self, AdminCap, SurveyCreatorBadge, BadgeStats};
    use sui::test_scenario::{Self as ts};
    use std::string;
    use std::option;

    const ADMIN: address = @0xAD;
    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;
    const CHARLIE: address = @0xC;
    const USER1: address = @0x1;
    const USER2: address = @0x2;
    const USER3: address = @0x3;
    const USER4: address = @0x4;
    const USER5: address = @0x5;
    const USER6: address = @0x6;
    const USER7: address = @0x7;
    const USER8: address = @0x8;
    const USER9: address = @0x9;
    const USER10: address = @0x10;

    // ========================================
    // TEST 1: 3 Bedava Anket + Limit
    // ========================================
    #[test]
    fun test_free_survey_limit() {
        let mut scenario = ts::begin(ADMIN);

        {
            survey::init_for_testing(ts::ctx(&mut scenario));
        };

        // Alice 3 bedava anket oluşturur
        let mut i = 0;
        while (i < 3) {
            ts::next_tx(&mut scenario, ALICE);
            let mut user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            survey::create_survey(
                &mut user_limit,
                string::utf8(b"Survey"),
                string::utf8(b"Desc"),
                ts::ctx(&mut scenario)
            );
            
            assert!(survey::get_user_survey_count(&user_limit, ALICE) == i + 1, 0);
            
            ts::return_shared(user_limit);
            i = i + 1;
        };

        // 4. anket oluşturamaz
        {
            ts::next_tx(&mut scenario, ALICE);
            let user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            assert!(!survey::can_create_free_survey(&user_limit, ALICE), 1);
            assert!(survey::get_remaining_free_surveys(&user_limit, ALICE) == 0, 2);
            
            ts::return_shared(user_limit);
        };

        ts::end(scenario);
    }

    // ========================================
    // TEST 2: Badge ile 1 Anket Oluştur (Badge Yakılır)
    // ========================================
    #[test]
    fun test_badge_burns_after_use() {
        let mut scenario = ts::begin(ADMIN);

        {
            survey::init_for_testing(ts::ctx(&mut scenario));
            badge::init_for_testing(ts::ctx(&mut scenario));
        };

        // Alice 3 bedava anket oluşturur
        let mut i = 0;
        while (i < 3) {
            ts::next_tx(&mut scenario, ALICE);
            let mut user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            survey::create_survey(
                &mut user_limit,
                string::utf8(b"Free Survey"),
                string::utf8(b"Desc"),
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(user_limit);
            i = i + 1;
        };

        // Admin Alice'e 1 badge verir
        {
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = badge::create_admin_cap_for_testing(ts::ctx(&mut scenario));
            let mut stats = ts::take_shared<BadgeStats>(&scenario);
            
            badge::mint_creator_badge(
                &admin_cap,
                &mut stats,
                1, // Bronze
                ALICE,
                ts::ctx(&mut scenario)
            );
            
            transfer::public_transfer(admin_cap, ADMIN);
            ts::return_shared(stats);
        };

        // Alice badge ile 4. anketi oluşturur (badge yakılır)
        {
            ts::next_tx(&mut scenario, ALICE);
            let badge = ts::take_from_sender<SurveyCreatorBadge>(&scenario);
            
            survey::create_survey_with_badge(
                badge, // Ownership transfer (yakılacak)
                string::utf8(b"Survey with Badge"),
                string::utf8(b"Desc"),
                ts::ctx(&mut scenario)
            );
            
            // Badge artık yok!
        };

        // Alice'in artık badge'i yok
        {
            ts::next_tx(&mut scenario, ALICE);
            assert!(!ts::has_most_recent_for_sender<SurveyCreatorBadge>(&scenario), 0);
        };

        ts::end(scenario);
    }

    // ========================================
    // TEST 3: Katılım Sayısı Takibi
    // ========================================
    #[test]
    fun test_participation_tracking() {
        let mut scenario = ts::begin(ADMIN);

        {
            survey::init_for_testing(ts::ctx(&mut scenario));
        };

        // Alice anket oluşturur
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            survey::create_survey(
                &mut user_limit,
                string::utf8(b"Survey"),
                string::utf8(b"Desc"),
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(user_limit);
        };

        // Soru ekle
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut survey = ts::take_shared<Survey>(&scenario);
            
            survey::add_question(
                &mut survey,
                string::utf8(b"Question?"),
                vector[string::utf8(b"A"), string::utf8(b"B")],
                false,
                1,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(survey);
        };

        // Bob katılır
        {
            ts::next_tx(&mut scenario, BOB);
            let mut survey = ts::take_shared<Survey>(&scenario);
            let mut user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            let mut selections = vector::empty<vector<u64>>();
            vector::push_back(&mut selections, vector::singleton(0u64));
            
            let mut free_texts = vector::empty<Option<string::String>>();
            vector::push_back(&mut free_texts, option::none());
            
            survey::submit_response(
                &mut survey,
                &mut user_limit,
                selections,
                free_texts,
                ts::ctx(&mut scenario)
            );
            
            // Bob 1 ankete katıldı
            assert!(survey::get_user_response_count(&user_limit, BOB) == 1, 0);
            
            // Survey 1 katılımcıya sahip
            assert!(survey::get_survey_participant_count(&survey) == 1, 1);
            
            ts::return_shared(survey);
            ts::return_shared(user_limit);
        };

        // Charlie katılır
        {
            ts::next_tx(&mut scenario, CHARLIE);
            let mut survey = ts::take_shared<Survey>(&scenario);
            let mut user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            let mut selections = vector::empty<vector<u64>>();
            vector::push_back(&mut selections, vector::singleton(1u64));
            
            let mut free_texts = vector::empty<Option<string::String>>();
            vector::push_back(&mut free_texts, option::none());
            
            survey::submit_response(
                &mut survey,
                &mut user_limit,
                selections,
                free_texts,
                ts::ctx(&mut scenario)
            );
            
            // Charlie 1 ankete katıldı
            assert!(survey::get_user_response_count(&user_limit, CHARLIE) == 1, 2);
            
            // Survey 2 katılımcıya sahip
            assert!(survey::get_survey_participant_count(&survey) == 2, 3);
            
            ts::return_shared(survey);
            ts::return_shared(user_limit);
        };

        ts::end(scenario);
    }

    // ========================================
    // TEST 4: Milestone Event (10 Katılımcı)
    // ========================================
    #[test]
    fun test_milestone_10_participants() {
        let mut scenario = ts::begin(ADMIN);

        {
            survey::init_for_testing(ts::ctx(&mut scenario));
        };

        // Alice anket oluşturur
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            survey::create_survey(
                &mut user_limit,
                string::utf8(b"Survey"),
                string::utf8(b"Desc"),
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(user_limit);
        };

        // Soru ekle
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut survey = ts::take_shared<Survey>(&scenario);
            
            survey::add_question(
                &mut survey,
                string::utf8(b"Q?"),
                vector[string::utf8(b"A"), string::utf8(b"B")],
                false,
                1,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(survey);
        };

        // ← DÜZELTİLDİ: Sabit adresler kullan
        let users = vector[USER1, USER2, USER3, USER4, USER5, USER6, USER7, USER8, USER9, USER10];
        let mut i = 0;
        while (i < 10) {
            let user = *vector::borrow(&users, i);
            
            ts::next_tx(&mut scenario, user);
            let mut survey = ts::take_shared<Survey>(&scenario);
            let mut user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            let mut selections = vector::empty<vector<u64>>();
            vector::push_back(&mut selections, vector::singleton(0u64));
            
            let mut free_texts = vector::empty<Option<string::String>>();
            vector::push_back(&mut free_texts, option::none());
            
            survey::submit_response(
                &mut survey,
                &mut user_limit,
                selections,
                free_texts,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(survey);
            ts::return_shared(user_limit);
            
            i = i + 1;
        };

        // Survey 10 katılımcıya sahip (Milestone!)
        {
            ts::next_tx(&mut scenario, ADMIN);
            let survey = ts::take_shared<Survey>(&scenario);
            
            assert!(survey::get_survey_participant_count(&survey) == 10, 0);
            
            ts::return_shared(survey);
        };

        ts::end(scenario);
    }

    // ========================================
    // TEST 5: Tam Akış - 3 Bedava + Badge Satın Al
    // ========================================
    #[test]
    fun test_full_flow_free_plus_badge() {
        let mut scenario = ts::begin(ADMIN);

        {
            survey::init_for_testing(ts::ctx(&mut scenario));
            badge::init_for_testing(ts::ctx(&mut scenario));
        };

        // Alice 3 bedava anket
        let mut i = 0;
        while (i < 3) {
            ts::next_tx(&mut scenario, ALICE);
            let mut user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            survey::create_survey(
                &mut user_limit,
                string::utf8(b"Free Survey"),
                string::utf8(b"Desc"),
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(user_limit);
            i = i + 1;
        };

        // Limit doldu
        {
            ts::next_tx(&mut scenario, ALICE);
            let user_limit = ts::take_shared<UserSurveyLimit>(&scenario);
            
            assert!(survey::get_user_survey_count(&user_limit, ALICE) == 3, 0);
            assert!(!survey::can_create_free_survey(&user_limit, ALICE), 1);
            
            ts::return_shared(user_limit);
        };

        // Admin 2 badge verir (2 ekstra anket için)
        let mut i = 0;
        while (i < 2) {
            ts::next_tx(&mut scenario, ADMIN);
            let admin_cap = badge::create_admin_cap_for_testing(ts::ctx(&mut scenario));
            let mut stats = ts::take_shared<BadgeStats>(&scenario);
            
            badge::mint_creator_badge(
                &admin_cap,
                &mut stats,
                1,
                ALICE,
                ts::ctx(&mut scenario)
            );
            
            transfer::public_transfer(admin_cap, ADMIN);
            ts::return_shared(stats);
            i = i + 1;
        };

        // Alice 2 badge kullanarak 2 anket daha oluşturur
        let mut i = 0;
        while (i < 2) {
            ts::next_tx(&mut scenario, ALICE);
            let badge = ts::take_from_sender<SurveyCreatorBadge>(&scenario);
            
            survey::create_survey_with_badge(
                badge,
                string::utf8(b"Badge Survey"),
                string::utf8(b"Desc"),
                ts::ctx(&mut scenario)
            );
            
            i = i + 1;
        };

        // Alice artık badge'i kalmadı
        {
            ts::next_tx(&mut scenario, ALICE);
            assert!(!ts::has_most_recent_for_sender<SurveyCreatorBadge>(&scenario), 2);
        };

        ts::end(scenario);
    }
}