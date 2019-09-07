import { createStackNavigator } from "react-navigation-stack";
import { createSwitchNavigator, } from "react-navigation";
import LogIn from "./LogIn";
import ForgotPassword from "./ForgotPassword";
import Register from "./Register";
import Interests from "./Interests";

const LogInStack = createStackNavigator({

    LogIn : LogIn, 
    ForgotPassword : ForgotPassword,
    Register : Register,
    Interests: Interests,
    
})

export const LoginMain = createSwitchNavigator({
    LogInStack: LogInStack,
},{
    initialRouteName: 'LogInStack',
})