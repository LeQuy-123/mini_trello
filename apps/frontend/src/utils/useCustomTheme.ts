import type { RootState } from '@store/index';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleTheme } from '@store/themeSlice';

export function useCustomTheme() {
	const dispatch = useAppDispatch();

	const { mode } = useAppSelector((state: RootState) => state.theme);

	return {
		mode,
		toggleTheme: () => dispatch(toggleTheme()),
	};
}
