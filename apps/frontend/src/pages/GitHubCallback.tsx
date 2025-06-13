import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@services/authService';
import { useAppDispatch } from '@store/hooks';
import { setAuth } from '@store/authSlice';

const GitHubCallback = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	useEffect(() => {
		const fetchProfile = async () => {
			const urlParams = new URLSearchParams(window.location.search);
			const token = urlParams.get('token');

			if (!token) {
				navigate('/signin');
				return;
			}

			try {
				// Call profile API with token
				const user = await authService.fetchProfile(token);

				// Update redux store and localStorage
				dispatch(setAuth({ user, token }));
				navigate('/boards');
			} catch (err) {
				console.error('GitHub login failed:', err);
				navigate('/signin');
			}
		};

		fetchProfile();
	}, []);
	return <div>Logging you in with GitHub...</div>;
};

export default GitHubCallback;
