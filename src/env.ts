import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_GA_MEASUREMENT_ID: {
		public: true,
		static: true,
		description: 'Google Analytics の測定 ID。未設定時は GA タグを読み込まない',
		schema: (value) => value ?? ''
	}
});
