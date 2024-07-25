import { IniField } from "../interfaces";

export const iniFields: IniField[] = [
    {
        key: 'MaxSmoothedFrameRate',
        displayName: 'Max Framerate',
        type: 'number',
        description: '[MaxSmoothedFrameRate] Set the maximum framerate (requires framerate smoothing to be enabled).',
    },
    {
        key: 'bSmoothFrameRate',
        displayName: 'Framerate Smoothing',
        type: 'boolean',
        description: '[bSmoothFrameRate] Allows custom framerate when enabled.',
    },
    {
        key: 'm_bTinyWeaponsEnabled',
        displayName: 'Reduce Weapon Size',
        type: 'boolean',
        description: '[m_bTinyWeaponsEnabled] Enable or disable tiny weapons.',
    },
    {
        key: 'DynamicLights',
        displayName: 'Dynamic Lights',
        type: 'boolean',
        description: '[DynamicLights] Significantly improves visuals, but has a very large performance impact (up to -50%).',
    },
    {
        key: 'DepthOfField',
        displayName: 'Post Processing',
        type: 'boolean',
        description: '[DepthOfField] Enable or disable post-processing.',
    },
    {
        key: 'Bloom',
        displayName: 'Bloom',
        type: 'boolean',
        description: '[Bloom] Enable or disable bloom.',
    },
    {
        key: 'MotionBlur',
        displayName: 'Motion Blur',
        type: 'boolean',
        description: '[MotionBlur] Enable or disable motion blur.',
    },
    {
        key: 'bForceStaticTerrain',
        displayName: 'Force Static Terrain',
        type: 'boolean',
        description: '[bForceStaticTerrain]  Disables terrain popping when false.',
    },
    {
        key: 'SpeedTreeLeaves',
        displayName: 'Tree Leaves',
        type: 'boolean',
        description: '[SpeedTreeLeaves] Enable or disable leaves on trees.',
    },
    {
        key: 'SpeedTreeFronds',
        displayName: 'Tree Branches',
        type: 'boolean',
        description: '[SpeedTreeFronds] Enable or disable branches on some trees.',
    },
    {
        key: 'AllowRadialBlur',
        displayName: 'Impact Distortion',
        type: 'boolean',
        description: '[AllowRadialBlur] When false, removes some of the distortions from weapon impacts.',
    },
    {
        key: 'OneFrameThreadLag',
        displayName: 'One Frame Thread Lag',
        type: 'boolean',
        description: '[OneFrameThreadLag] Reduces mouse latency when disabled.',
    },
    {
        key: 'UseVsync',
        displayName: 'Vsync',
        type: 'boolean',
        description: '[UseVsync] Enable or disable Vsync.',
    },
    {
        key: 'ResX',
        displayName: 'Res Width',
        type: 'number',
        description: '[ResX] Set the resolution width.',
    },
    {
        key: 'ResY',
        displayName: 'Res Height',
        type: 'number',
        description: '[ResY] Set the resolution height.',
    }
];

export const inputIniFields: IniField[] = [
    {
      key: 'bEnableMouseSmoothing',
      displayName: 'Mouse Smoothing',
      type: 'boolean',
      description: '[bEnableMouseSmoothing] Ties mouse sensitivity to framerate when enabled. Disable',
    },
    {
      key: 'FOVSetting',
      displayName: 'Field of View',
      type: 'number',
      description: '[FOVSetting] Set the field of view (Max 120).',
    },
    {
      key: 'MouseSensitivity',
      displayName: 'Mouse Sensitivity',
      type: 'number',
      description: '[MouseSensitivity] Set the mouse sensitivity (0-100).',
    }
  ];