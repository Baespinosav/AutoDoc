/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App'; // Asegúrate de que esta ruta sea correcta
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
