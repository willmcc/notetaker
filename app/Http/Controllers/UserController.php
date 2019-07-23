<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\User;
use App\Token;

class UserController extends Controller
{
  public function __construct()
	{
	 //  $this->middleware('auth:api');
	}

	/**
	* Display a listing of the resource.
	*
	* @return \Illuminate\Http\Response
	*/

	public function authenticate(Request $request)
	{
		$this->validate($request, [
			'email' => 'required',
			'password' => 'required'
		]);

		$user = User::where('email', $request->input('email'))->first();
	 
		$password = $request->input('password');
		$hash = $user->password;

		if(!password_verify($password, $hash) || !$user) {
			return response()->json(['status' => 'Authentication failed '],401);
		}
			 
		$token = new Token();
		
		// Generate random string to use as token.
		// While MD5 is generally unique, collisions can theoretically happen, so prepend the timestamp. 
		$str=rand(); 
		
		$tokenValue = time() . '_' . md5($str);
		$token = Token::create(
			array("user_id" => $user->id, 
				"token_value" => $tokenValue,
				"created_at" => gmdate('Y-m-d H:i:s'), 
				"expires_at" => gmdate('Y-m-d H:i:s', time() + (60 * 60 * 24 * 90)) )
		);

		$token->token_value = $tokenValue;

		return response()->json(['status' => 'success','token' => $token, 'user' => $user], 200);
		
	}

	// Invalidates the token and logs out
	public function logout(Request $request) 
	{
		$user = $request->user();

		$tokenValue = $request->header('Api-Token');

		if ($tokenValue) {
			$token = Token::where('token_value', $tokenValue)->where('deleted', '!=', true)->first();

			if ($user->id != $token->user_id) {
				// Attempting to log a user out with wrong token
				return response()->json(['status' => 'Token belongs to different user'],500);
			}
			
			$token->expires_at = gmdate('Y-m-d H:i:s');

			return response()->json(['status' => 'success'], 200);
		}

		return response()->json(['status' => 'Missing Api-Token value'],400);
	}

	// Returns the currently authenticated user
	public function me(Request $request) {
		$user = $request->user();

		$tokenValue = $request->header('Api-Token');

		if ($tokenValue) {
			$token = Token::where('token_value', $tokenValue)->where('deleted', '!=', true)->first();

			if ($user->id != $token->user_id) {
				// Attempting to fetch incorrect user
				return response()->json(['status' => 'Token mismatch'],500);
			}

			return $user;
		}

		return response()->json(['status' => 'Token required'],401);
	}
}	
?>