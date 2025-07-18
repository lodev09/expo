import { ParamListBase, StackRouter as RNStackRouter, StackNavigationState } from '@react-navigation/native';
import { NativeStackNavigationEventMap, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { ComponentProps } from 'react';
import { Protected } from '../views/Protected';
/**
 * We extend NativeStackNavigationOptions with our custom props
 * to allow for several extra props to be used on web, like modalWidth
 */
export type ExtendedStackNavigationOptions = NativeStackNavigationOptions & {
    webModalStyle?: {
        /**
         * Override the width of the modal (px or percentage). Only applies on web platform.
         * @platform web
         */
        width?: number | string;
        /**
         * Override the height of the modal (px or percentage). Applies on web desktop.
         * @platform web
         */
        height?: number | string;
        /**
         * Minimum height of the desktop modal (px or percentage). Overrides the default 640px clamp.
         * @platform web
         */
        minHeight?: number | string;
        /**
         * Minimum width of the desktop modal (px or percentage). Overrides the default 580px.
         * @platform web
         */
        minWidth?: number | string;
        /**
         * Override the border of the desktop modal (any valid CSS border value, e.g. '1px solid #ccc' or 'none').
         * @platform web
         */
        border?: string;
        /**
         * Override the overlay background color (any valid CSS color or rgba/hsla value).
         * @platform web
         */
        overlayBackground?: string;
    };
};
declare const RNStack: import("react").ForwardRefExoticComponent<Omit<Omit<import("@react-navigation/native-stack").NativeStackNavigatorProps, "children" | "layout" | "initialRouteName" | "id" | "screenOptions" | "screenListeners" | "screenLayout" | "UNSTABLE_router"> & import("@react-navigation/native").DefaultRouterOptions<string> & {
    children: React.ReactNode;
    layout?: ((props: {
        state: StackNavigationState<ParamListBase>;
        navigation: import("@react-navigation/native").NavigationHelpers<ParamListBase, {}>;
        descriptors: Record<string, import("@react-navigation/native").Descriptor<NativeStackNavigationOptions, import("@react-navigation/native").NavigationProp<ParamListBase, string, string | undefined, StackNavigationState<ParamListBase>, NativeStackNavigationOptions, NativeStackNavigationEventMap>, import("@react-navigation/native").RouteProp<ParamListBase, string>>>;
        children: React.ReactNode;
    }) => React.ReactElement) | undefined;
    screenListeners?: Partial<{
        transitionStart: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "transitionStart", unknown>;
        transitionEnd: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "transitionEnd", unknown>;
        gestureCancel: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "gestureCancel", unknown>;
        sheetDetentChange: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "sheetDetentChange", unknown>;
        focus: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "focus", unknown>;
        blur: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "blur", unknown>;
        state: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "state", unknown>;
        beforeRemove: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "beforeRemove", true>;
    }> | ((props: {
        route: import("@react-navigation/native").RouteProp<ParamListBase, string>;
        navigation: import("@react-navigation/native-stack").NativeStackNavigationProp<ParamListBase, string, undefined>;
    }) => Partial<{
        transitionStart: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "transitionStart", unknown>;
        transitionEnd: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "transitionEnd", unknown>;
        gestureCancel: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "gestureCancel", unknown>;
        sheetDetentChange: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "sheetDetentChange", unknown>;
        focus: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "focus", unknown>;
        blur: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "blur", unknown>;
        state: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "state", unknown>;
        beforeRemove: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "beforeRemove", true>;
    }>) | undefined;
    screenOptions?: NativeStackNavigationOptions | ((props: {
        route: import("@react-navigation/native").RouteProp<ParamListBase, string>;
        navigation: import("@react-navigation/native-stack").NativeStackNavigationProp<ParamListBase, string, undefined>;
        theme: ReactNavigation.Theme;
    }) => NativeStackNavigationOptions) | undefined;
    screenLayout?: ((props: {
        route: import("@react-navigation/native").RouteProp<ParamListBase, string>;
        navigation: import("@react-navigation/native-stack").NativeStackNavigationProp<ParamListBase, string, undefined>;
        theme: ReactNavigation.Theme;
        children: React.ReactElement;
    }) => React.ReactElement) | undefined;
    UNSTABLE_router?: (<Action extends Readonly<{
        type: string;
        payload?: object;
        source?: string;
        target?: string;
    }>>(original: import("@react-navigation/native").Router<StackNavigationState<ParamListBase>, Action>) => Partial<import("@react-navigation/native").Router<StackNavigationState<ParamListBase>, Action>>) | undefined;
} & {
    id?: undefined;
}, "children"> & Partial<Pick<Omit<import("@react-navigation/native-stack").NativeStackNavigatorProps, "children" | "layout" | "initialRouteName" | "id" | "screenOptions" | "screenListeners" | "screenLayout" | "UNSTABLE_router"> & import("@react-navigation/native").DefaultRouterOptions<string> & {
    children: React.ReactNode;
    layout?: ((props: {
        state: StackNavigationState<ParamListBase>;
        navigation: import("@react-navigation/native").NavigationHelpers<ParamListBase, {}>;
        descriptors: Record<string, import("@react-navigation/native").Descriptor<NativeStackNavigationOptions, import("@react-navigation/native").NavigationProp<ParamListBase, string, string | undefined, StackNavigationState<ParamListBase>, NativeStackNavigationOptions, NativeStackNavigationEventMap>, import("@react-navigation/native").RouteProp<ParamListBase, string>>>;
        children: React.ReactNode;
    }) => React.ReactElement) | undefined;
    screenListeners?: Partial<{
        transitionStart: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "transitionStart", unknown>;
        transitionEnd: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "transitionEnd", unknown>;
        gestureCancel: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "gestureCancel", unknown>;
        sheetDetentChange: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "sheetDetentChange", unknown>;
        focus: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "focus", unknown>;
        blur: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "blur", unknown>;
        state: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "state", unknown>;
        beforeRemove: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "beforeRemove", true>;
    }> | ((props: {
        route: import("@react-navigation/native").RouteProp<ParamListBase, string>;
        navigation: import("@react-navigation/native-stack").NativeStackNavigationProp<ParamListBase, string, undefined>;
    }) => Partial<{
        transitionStart: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "transitionStart", unknown>;
        transitionEnd: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "transitionEnd", unknown>;
        gestureCancel: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "gestureCancel", unknown>;
        sheetDetentChange: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "sheetDetentChange", unknown>;
        focus: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "focus", unknown>;
        blur: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "blur", unknown>;
        state: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "state", unknown>;
        beforeRemove: import("@react-navigation/native").EventListenerCallback<NativeStackNavigationEventMap & import("@react-navigation/native").EventMapCore<StackNavigationState<ParamListBase>>, "beforeRemove", true>;
    }>) | undefined;
    screenOptions?: NativeStackNavigationOptions | ((props: {
        route: import("@react-navigation/native").RouteProp<ParamListBase, string>;
        navigation: import("@react-navigation/native-stack").NativeStackNavigationProp<ParamListBase, string, undefined>;
        theme: ReactNavigation.Theme;
    }) => NativeStackNavigationOptions) | undefined;
    screenLayout?: ((props: {
        route: import("@react-navigation/native").RouteProp<ParamListBase, string>;
        navigation: import("@react-navigation/native-stack").NativeStackNavigationProp<ParamListBase, string, undefined>;
        theme: ReactNavigation.Theme;
        children: React.ReactElement;
    }) => React.ReactElement) | undefined;
    UNSTABLE_router?: (<Action extends Readonly<{
        type: string;
        payload?: object;
        source?: string;
        target?: string;
    }>>(original: import("@react-navigation/native").Router<StackNavigationState<ParamListBase>, Action>) => Partial<import("@react-navigation/native").Router<StackNavigationState<ParamListBase>, Action>>) | undefined;
} & {
    id?: undefined;
}, "children">> & import("react").RefAttributes<unknown>> & {
    Screen: (props: import("../useScreens").ScreenProps<ExtendedStackNavigationOptions, StackNavigationState<ParamListBase>, NativeStackNavigationEventMap>) => null;
    Protected: typeof Protected;
};
/**
 * React Navigation matches a screen by its name or a 'getID' function that uniquely identifies a screen.
 * When a screen has been uniquely identified, the Stack can only have one instance of that screen.
 *
 * Expo Router allows for a screen to be matched by name and path params, a 'getID' function or a singular id.
 *
 * Instead of reimplementing the entire StackRouter, we can override the getStateForAction method to handle the singular screen logic.
 *
 */
export declare const stackRouterOverride: NonNullable<ComponentProps<typeof RNStack>['UNSTABLE_router']>;
declare const Stack: ((props: ComponentProps<typeof RNStack>) => import("react").JSX.Element) & {
    Screen: (props: ComponentProps<typeof RNStack.Screen> & {
        singular?: boolean;
    }) => null;
    Protected: import("react").FunctionComponent<import("../views/Protected").ProtectedProps>;
};
export default Stack;
export declare const StackRouter: typeof RNStackRouter;
//# sourceMappingURL=StackClient.d.ts.map