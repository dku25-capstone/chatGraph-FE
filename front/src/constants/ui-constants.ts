// Graph Visualization Constants
export const GRAPH_CONFIG = {
    ZOOM: {
        MIN: 0.1,
        MAX: 3,
    },
    LINK: {
        DISTANCE: {
            ROOT: 180,
            DEFAULT: 120,
        },
        STRENGTH: 0.8,
    },
    FORCE: {
        CHARGE_STRENGTH: -1200,
        COLLISION_RADIUS: {
            ROOT: 80,
            DEFAULT: 55,
        },
    },
    NODE: {
        RADIUS: {
            ROOT: 60,
            DEFAULT: 35,
            HOVER_INCREASE: 8,
        },
    },
    TRANSITION: {
        DURATION: {
            DEFAULT: 300,
            FAST: 200,
        },
    },
} as const;

// Sidebar UI Constants
export const SIDEBAR_CONFIG = {
    WIDTH: 260,
    ANIMATION_DELAY_MS: 300,
    SKELETON_COUNT: 5,
    ICON_SIZE: {
        SMALL: 32,
        LARGE: 48,
    },
} as const;
