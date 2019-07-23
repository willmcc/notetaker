<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Note;

class NoteController extends Controller
{
	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		//
	}

	public function showAllNotes(Request $request)
	{
		$skip = 0;
		$take = 0;
		if ($request->input('skip') && $request->input('skip')) {
			$skip = $request->input('skip');
			$take = $request->input('take');
		}
		
		$user = $request->user();

		$notesBase = $notes = Note::where('user_id', $user->id)->where('deleted', '=', null)->orderBy('updated_at', 'desc');

		// Use Skip and Take for pagination in the front-end. Take == 0 will take everything in the table.
		if ($skip > 0) {
			$notesBase = $notesBase->skip($skip);
		}
		if ($take > 0) {
			$notesBase = $notesBase->take($take);
		}
		
		$notes = $notesBase->get();

		return response()->json($notes);
	}

	public function showOneNote($id, Request $request)
	{
		$user = $request->user();

		$note = Note::where('note_id', $id)->first();

		if ($user->id != $note->userID) {
			// return error
			return response()->json(['status' => 'Note belongs to different user'],403);
		}
		
		return response()->json($note);
	}

	public function create(Request $request)
	{
		$user = $request->user();

		$this->validate($request, [
			'title' => 'required',
			'content' => 'required'
		]);

		$note = Note::create(
			array("user_id" => $user->id, 
				"title" => $request['title'],
				"content" => $request['content'])
		);

		return response()->json($note, 201);
	}

	public function update($id, Request $request)
	{
		$user = $request->user();

		$this->validate($request, [
			'title' => 'required',
			'content' => 'required'
		]);

		$note = Note::where('note_id', $id)->first();

		if ($user->id != $note->user_id) {
			// return error if user tries to update someone else's note
			return response()->json(['status' => 'Note belongs to different user'],403);
		}

		$note->update(
			array("user_id" => $user->id, 
				"note_id" => $id,
				"title" => $request['title'],
				"content" => $request['content'])
		);

		return response()->json($note, 200);
	}

	public function delete($id, Request $request)
	{
		$user = $request->user();

	   
		// This performs a "soft delete" so that in the event of accidental deletion, etc. it can be recovered.
		$note = Note::where('note_id', $id)->first();

		if ($user->id != $note->user_id) {
			return response()->json(['status' => 'Note belongs to different user'],403);
		}

		$note->deleted = true;
		$note->update(array ('note_id' => $id,
		'deleted' => true,));

		return response()->json($note, 200);
	}
	//
}
