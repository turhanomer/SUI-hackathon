module voting_system::badge {
    use std::string::{Self, String};
    use sui::url::{Self, Url};
    use sui::event;

    // Hata kodları
    const E_INVALID_TIER: u64 = 1;

    // Badge tipleri
    const BADGE_TYPE_CREATOR: u8 = 1;
    const BADGE_TYPE_VERIFIED: u8 = 2;

    // Admin capability
    public struct AdminCap has key, store {
        id: UID,
    }

    // NFT Badge
    public struct SurveyCreatorBadge has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: Url,
        badge_type: u8,
        tier: u8,
        extra_surveys_allowed: u64,
        minted_at: u64,
        owner: address,
    }

    // Badge istatistikleri
    public struct BadgeStats has key {
        id: UID,
        total_minted: u64,
        creator_badges: u64,
        verified_badges: u64,
        whale_badges: u64,
    }

    // Events
    public struct BadgeMinted has copy, drop {
        badge_id: ID,
        owner: address,
        badge_type: u8,
        tier: u8,
    }

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, ctx.sender());

        let stats = BadgeStats {
            id: object::new(ctx),
            total_minted: 0,
            creator_badges: 0,
            verified_badges: 0,
            whale_badges: 0,
        };
        transfer::share_object(stats);
    }

    // Creator badge bas
    public fun mint_creator_badge(
        _admin: &AdminCap,
        stats: &mut BadgeStats,
        tier: u8,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(tier >= 1 && tier <= 3, E_INVALID_TIER);

        let extra_surveys = 1;

        let badge = SurveyCreatorBadge {
            id: object::new(ctx),
            name: get_badge_name(tier),
            description: string::utf8(b"Allows creating extra surveys"),
            image_url: url::new_unsafe_from_bytes(get_badge_image_url(tier)),
            badge_type: BADGE_TYPE_CREATOR,
            tier,
            extra_surveys_allowed: extra_surveys,
            minted_at: ctx.epoch(),
            owner: recipient,
        };

        let badge_id = object::id(&badge);

        stats.total_minted = stats.total_minted + 1;
        stats.creator_badges = stats.creator_badges + 1;

        event::emit(BadgeMinted {
            badge_id,
            owner: recipient,
            badge_type: BADGE_TYPE_CREATOR,
            tier,
        });

        transfer::public_transfer(badge, recipient);
    }

    // Verified badge
    public fun mint_verified_badge(
        _admin: &AdminCap,
        stats: &mut BadgeStats,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let badge = SurveyCreatorBadge {
            id: object::new(ctx),
            name: string::utf8(b"Verified Creator"),
            description: string::utf8(b"Verified user badge"),
            image_url: url::new_unsafe_from_bytes(b"https://example.com/verified.png"),
            badge_type: BADGE_TYPE_VERIFIED,
            tier: 1,
            extra_surveys_allowed: 0,
            minted_at: ctx.epoch(),
            owner: recipient,
        };

        let badge_id = object::id(&badge);

        stats.total_minted = stats.total_minted + 1;
        stats.verified_badges = stats.verified_badges + 1;

        event::emit(BadgeMinted {
            badge_id,
            owner: recipient,
            badge_type: BADGE_TYPE_VERIFIED,
            tier: 1,
        });

        transfer::public_transfer(badge, recipient);
    }

    // Badge transfer
    public fun transfer_badge(
        badge: SurveyCreatorBadge,
        recipient: address,
    ) {
        transfer::public_transfer(badge, recipient);
    }

    // Badge yak
    public fun burn_badge(badge: SurveyCreatorBadge) {
        let SurveyCreatorBadge { 
            id, 
            name: _, 
            description: _, 
            image_url: _, 
            badge_type: _, 
            tier: _, 
            extra_surveys_allowed: _, 
            minted_at: _, 
            owner: _ 
        } = badge;
        object::delete(id);
    }

    // Getters
    public fun get_extra_surveys_allowed(badge: &SurveyCreatorBadge): u64 {
        badge.extra_surveys_allowed
    }

    public fun is_creator_badge(badge: &SurveyCreatorBadge): bool {
        badge.badge_type == BADGE_TYPE_CREATOR
    }

    public fun get_tier(badge: &SurveyCreatorBadge): u8 {
        badge.tier
    }

    fun get_badge_name(tier: u8): String {
        if (tier == 1) {
            string::utf8(b"Bronze Creator Badge")
        } else if (tier == 2) {
            string::utf8(b"Silver Creator Badge")
        } else {
            string::utf8(b"Gold Creator Badge")
        }
    }

    fun get_badge_image_url(tier: u8): vector<u8> {
        if (tier == 1) {
            b"https://example.com/bronze-badge.png"
        } else if (tier == 2) {
            b"https://example.com/silver-badge.png"
        } else {
            b"https://example.com/gold-badge.png"
        }
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    #[test_only]
    public fun create_admin_cap_for_testing(ctx: &mut TxContext): AdminCap {
        AdminCap {
            id: object::new(ctx),
        }
    }
}