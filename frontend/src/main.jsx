import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App />
    </Provider>,
)