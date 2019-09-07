import {firebaseConfigVariables} from './env'

export const firebaseConfig = {
  apiKey: firebaseConfigVariables.apiKey,
  authDomain: firebaseConfigVariables.authDomain,
  databaseURL: firebaseConfigVariables.databaseURL,
  projectId: firebaseConfigVariables.projectId,
  storageBucket: firebaseConfigVariables.storageBucket,
  messagingSenderId: firebaseConfigVariables.messagingSenderId,
  appId: firebaseConfigVariables.appId
};
