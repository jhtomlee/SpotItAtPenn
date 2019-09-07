import { createStackNavigator } from "react-navigation-stack";
import { createSwitchNavigator, } from "react-navigation";
import LogIn from "./LogIn";
import ForgotPassword from "./ForgotPassword";
import Register from "./Register";

const LogInStack = createStackNavigator({
    LogIn : LogIn, 
    ForgotPassword : ForgotPassword,
    Register : Register,
})

export const LoginMain = createSwitchNavigator({
    LogInStack: LogInStack,
},{
    initialRouteName: 'LogInStack',
})