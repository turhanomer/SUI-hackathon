module voting_system::profile {

use std::string::String;
use sui::table::{Self, Table};
use sui::clock::Clock;
use sui::url::Url;

    // Hata kodları
    const E_PROFILE_EXISTS: u64 = 0;
    const E_NOT_OWNER: u64 = 1;

    // Herkesin erişebildiği global kayıt
    public struct ProfileRegistry has key {
        id: UID,
        profiles: Table<address, ID>,
    }

    public struct UserProfile has key, store {
        id: UID,
        owner: address,
        username: String,
        bio: String,
        avatar_url: Option<Url>,
        created_at: u64,
        last_activity: u64,

        stats_id: ID,
        gamification_id: ID,
    }

    public struct UserStats has key, store {
        id: UID,
        polls_created: u64,
        polls_participated: u64,  // ← YENİ: Katıldığı anket sayısı
        total_votes_cast: u64,
    }

    public struct Gamification has key, store {
        id: UID,
        is_verified: bool,
        owned_badge_ids: vector<ID>,
        achievements_unlocked: vector<String>,
        total_points: u64,
    }

    fun init(ctx: &mut TxContext) {
        let registry = ProfileRegistry {
            id: object::new(ctx),
            profiles: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    public fun create_profile(
        registry: &mut ProfileRegistry,
        username: String,
        bio: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!table::contains(&registry.profiles, ctx.sender()), E_PROFILE_EXISTS);

        let current_time = clock.timestamp_ms();

        let stats = UserStats {
            id: object::new(ctx),
            polls_created: 0,
            polls_participated: 0,  // ← Başlangıçta 0
            total_votes_cast: 0,
        };
        let stats_id = object::id(&stats);

        let gamification = Gamification {
            id: object::new(ctx),
            is_verified: false,
            owned_badge_ids: vector::empty(),
            achievements_unlocked: vector::empty(),
            total_points: 0,
        };
        let gamification_id = object::id(&gamification);

        let profile = UserProfile {
            id: object::new(ctx),
            owner: ctx.sender(),
            username,
            bio,
            avatar_url: option::none(),
            created_at: current_time,
            last_activity: current_time,
            stats_id,
            gamification_id,
        };

        let profile_id = object::id(&profile);
        table::add(&mut registry.profiles, ctx.sender(), profile_id);

        transfer::public_transfer(profile, ctx.sender());
        transfer::public_transfer(stats, ctx.sender());
        transfer::public_transfer(gamification, ctx.sender());
    }

    public fun get_profile_id(registry: &ProfileRegistry, addr: address): Option<ID> {
        if (table::contains(&registry.profiles, addr)) {
            option::some(*table::borrow(&registry.profiles, addr))
        } else {
            option::none()
        }
    }

    public fun has_profile(registry: &ProfileRegistry, addr: address): bool {
        table::contains(&registry.profiles, addr)
    }

    public fun is_online(profile: &UserProfile, clock: &Clock): bool {
        let current_time = clock.timestamp_ms();
        let five_minutes = 300000;
    
        if (current_time < profile.last_activity) {
            return false
        };
    
        current_time - profile.last_activity < five_minutes
    }

    public fun update_activity(
        profile: &mut UserProfile, 
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(profile.owner == ctx.sender(), E_NOT_OWNER);
        profile.last_activity = clock.timestamp_ms();
    }

    // Stats fonksiyonları
    public fun increment_polls_created(stats: &mut UserStats) {
        stats.polls_created = stats.polls_created + 1;
    }

    // ← YENİ FONKSİYON
    public fun increment_polls_participated(stats: &mut UserStats) {
        stats.polls_participated = stats.polls_participated + 1;
    }

    public fun increment_votes_cast(stats: &mut UserStats) {
        stats.total_votes_cast = stats.total_votes_cast + 1;
    }

    // Gamification fonksiyonları
    public fun add_badge(gamification: &mut Gamification, badge_id: ID) {
        gamification.owned_badge_ids.push_back(badge_id);
    }

    public fun add_achievement(gamification: &mut Gamification, achievement: String) {
        gamification.achievements_unlocked.push_back(achievement);
    }

    public fun add_points(gamification: &mut Gamification, points: u64) {
        gamification.total_points = gamification.total_points + points;
    }

    // Getters
    public fun get_polls_created(stats: &UserStats): u64 {
        stats.polls_created
    }

    // ← YENİ GETTER
    public fun get_polls_participated(stats: &UserStats): u64 {
        stats.polls_participated
    }

    public fun get_total_votes_cast(stats: &UserStats): u64 {
        stats.total_votes_cast
    }

    public fun get_total_points(gamification: &Gamification): u64 {
        gamification.total_points
    }

    public fun is_owner(profile: &UserProfile, addr: address): bool {
        profile.owner == addr
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}