/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import App from './App'
import { UserProvider } from './context/UserContext'

const root = document.getElementById('root')

render(() => (
    <UserProvider>
        <App />
    </UserProvider>
), root!)
