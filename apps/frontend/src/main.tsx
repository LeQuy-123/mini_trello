import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { Provider } from 'react-redux';
import { store } from '@store/index.ts';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<>
			<Provider store={store}>
				<App />
			</Provider>
			<ToastContainer />
		</>
	</BrowserRouter>
);
