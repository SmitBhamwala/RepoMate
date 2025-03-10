// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable
} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: "understandyourcodeai.firebaseapp.com",
	projectId: "understandyourcodeai",
	storageBucket: "understandyourcodeai.firebasestorage.app",
	messagingSenderId: "348442438541",
	appId: "1:348442438541:web:3567663778020389fd6bc4",
	measurementId: "G-PDHXKSDKSX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function uploadFile(
	file: File,
	setProgress?: (progress: number) => void
) {
	return new Promise((resolve, reject) => {
		try {
			const storageRef = ref(storage, file.name);
			const uploadTask = uploadBytesResumable(storageRef, file);

			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress = Math.round(
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100
					);
					if (setProgress) {
						setProgress(progress);
					}
					switch (snapshot.state) {
						case "paused":
							console.log("Upload is paused");
							break;
						case "running":
							console.log("Upload is running");
							break;
					}
				},
				(error) => {
					reject(error);
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
						resolve(downloadUrl as string);
					});
				}
			);
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
}
