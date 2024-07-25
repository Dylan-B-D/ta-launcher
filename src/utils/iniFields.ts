import { IniField } from "../interfaces";

export const iniFields: IniField[] = [
    {
        key: 'DynamicLights',
        displayName: 'Dynamic Lights',
        type: 'boolean',
        description: 'Significantly improves visuals, but has a very large performance impact (up to -50%).',
    },
    {
        key: 'DepthOfField',
        displayName: 'Depth of Field',
        type: 'boolean',
        description: 'Enable or disable post-processing.',
    },
    {
        key: 'MaxSmoothedFrameRate',
        displayName: 'Max Smoothed Frame Rate',
        type: 'number',
        description: 'Set the maximum framerate (requires framerate smoothing to be enabled).',
    },
    {
        key: 'Bloom',
        displayName: 'Bloom',
        type: 'boolean',
        description: 'Enable or disable bloom.',
    },
    {
        key: 'MotionBlur',
        displayName: 'Motion Blur',
        type: 'boolean',
        description: 'Enable or disable motion blur.',
    },
    {
        key: 'bSmoothFrameRate',
        displayName: 'Framerate Smoothing',
        type: 'boolean',
        description: 'Enabled: Allows custom framerate.',
    },
    {
        key: 'bForceStaticTerrain',
        displayName: 'Force Static Terrain',
        type: 'boolean',
        description: 'False: Disables terrain popping.',
    },
    {
        key: 'SpeedTreeLeaves',
        displayName: 'Speed Tree Leaves',
        type: 'boolean',
        description: 'Enable or disable leaves on trees.',
    },
    {
        key: 'SpeedTreeFronds',
        displayName: 'Speed Tree Leaves',
        type: 'boolean',
        description: 'Enable or disable branches on some trees.',
    },
    {
        key: 'AllowRadialBlur',
        displayName: 'Allow Radial Blur',
        type: 'boolean',
        description: 'When false, removes some of the distortions from weapon impacts.',
    },
];