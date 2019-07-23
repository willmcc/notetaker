<?php

namespace App\Providers;

use App\User;
use App\Token;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
	/**
	 * Register any application services.
	 *
	 * @return void
	 */
	public function register()
	{
		//
	}

	/**
	 * Boot the authentication services for the application.
	 *
	 * @return void
	 */
	public function boot()
	{
		// Here you may define how you wish users to be authenticated for your Lumen
		// application. The callback which receives the incoming request instance
		// should return either a User instance or null. You're free to obtain
		// the User instance via an API token or any other method necessary.

		$this->app['auth']->viaRequest('api', function ($request) {
			$tokenValue = $request->header('Api-Token');

			if ($tokenValue) {
				$token = Token::where('token_value', $tokenValue)->where('deleted', '!=', true)->first();

				if (!$token) {
					return null;		
				}

				// Check that token is still valid
				$now = gmdate('Y-m-d H:i:s');


				if ($now > $token->expires_at) {
					return null;
				}
				
				$user = User::where('id', $token->user_id)->first();

				return $user;
			}

			return null;
		});
	}
}
