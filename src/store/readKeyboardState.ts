/**
 * Basic Keyboard State Atoms for Read/Speech Practice Feature
 * 
 * Contains the fundamental state atoms for the read feature where users
 * practice reading text aloud and get scored on accuracy and clarity.
 * 
 * @module readKeyboardState
 */

import { atom } from "nanostores";
import { KBTYPINGSTATE } from "@/constants/keyboardState";

/**
 * Current recording state for read practice
 * Tracks whether user is idle, recording, or has completed
 */
export const $readKbTypingState = atom<KBTYPINGSTATE>(KBTYPINGSTATE.IDLE);

/**
 * The sentence being read in read practice
 * Contains the text the user should read aloud
 */
export const $readKbSentence = atom<string>("");

/**
 * The text transcribed from user's speech
 * Used for real-time comparison with the target sentence
 */
export const $readKbTranscribedText = atom<string>("");

/**
 * Stopwatch tracking elapsed time in seconds
 * Updates every second while recording is in progress
 */
export const $readStopwatch = atom<number>(0);

/**
 * Whether recording is currently active
 */
export const $readIsRecording = atom<boolean>(false);

/**
 * Speech recognition confidence scores
 * Array of confidence values from speech recognition API
 */
export const $readConfidenceScores = atom<number[]>([]);
