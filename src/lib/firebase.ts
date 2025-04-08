import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable
} from "firebase/storage";

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "fir-4bb42.firebaseapp.com",
  projectId: "fir-4bb42",
  storageBucket: "fir-4bb42.firebasestorage.app",
  messagingSenderId: "654119151897",
  appId: "1:654119151897:web:d0ce6f04bf96321b80fd88"
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
