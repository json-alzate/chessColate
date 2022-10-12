import { Injectable } from '@angular/core';

/** Capacitor Modules **/
import { ConnectionStatus, Network } from '@capacitor/network';

import { randomNumber } from '@utils/random-number';

/** Firebase Modules **/
import { getApp } from 'firebase/app';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Firestore,
  DocumentReference,
  DocumentData,
  FirestoreSettings,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  getFirestore,
  initializeFirestore,
  enableIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
  collection, query, where, getDocs,
  increment,
  limit
} from 'firebase/firestore';


// Models
import { Profile } from '@models/profile.model';
import { CoordinatesPuzzle } from '@models/coordinates-puzzles.model';
import { Puzzle } from '@models/puzzle.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private db: Firestore;
  private profileDocRef: DocumentReference<DocumentData>;



  constructor() { }

  async init() {
    const firestoreSettings: FirestoreSettings & { useFetchStreams: boolean } = {
      useFetchStreams: false
    };
    initializeFirestore(getApp(), firestoreSettings);
    this.db = getFirestore(getApp());
    await enableIndexedDbPersistence(this.db)
      .then(async () => {
        const status: ConnectionStatus = await Network.getStatus();
        if (!status.connected) {
          await this.disableNetwork();
        }
      })
      .catch((err) => {
        console.log('Error in persistence', err);
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
        } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
        }
      });
  }

  async disableNetwork() {
    await disableNetwork(this.db);
  }

  async enableNetwork() {
    await enableNetwork(this.db);
  }


  /**************************************************************/
  /* PROFILE                                                      */
  /**************************************************************/

  /**
   * Get a user from Firestore
   *
   * @param uid
   * @returns Promise<User>
   */
  async getProfile(uid: string): Promise<Profile> {

    this.profileDocRef = doc(this.db, 'Users', uid);
    const docSnap = await getDoc(this.profileDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    } else {
      console.log(`No user found with uid ${uid}`);
      return null;
    }

  }


  /**
   * Crea un nuevo perfil
   *
   * @param profile
   * @returns Promise<void>
   */
  createProfile(profile: Profile) {
    return setDoc(doc(this.db, 'Users', profile.uid), profile);
  }

  /**
   * Update a User in firestore
   *
   * @param changes Partial<User>
   */
  async updateProfile(changes: Partial<Profile>): Promise<void> {
    return updateDoc(this.profileDocRef, changes);
  }


  async checkNickname(nickName: string): Promise<string[]> {
    const nicksToReturn = [];
    const q = query(
      collection(this.db, 'nickNames'),
      where('nickname', '==', nickName)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((document) => {
      const nickToAdd = document.data();
      nicksToReturn.push(nickToAdd);
    });
    return nicksToReturn;

  }


  async addNewNickName(nickname: string, uidUser: string): Promise<string> {
    const docRef = await addDoc(collection(this.db, 'nickNames'), {
      nickname,
      uidUser
    });
    return docRef.id;
  }


  /**
   // ----------------------------------------------------------------------------
   Coordinates Puzzles
   */

  async getCoordinatesPuzzles(uidUser: string): Promise<CoordinatesPuzzle[]> {
    const coordinatesPuzzlesToReturn: CoordinatesPuzzle[] = [];
    const q = query(
      collection(this.db, 'coordinatesPuzzles'),
      where('uidUser', '==', uidUser)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((document) => {
      const themeToAdd = document.data() as CoordinatesPuzzle;
      themeToAdd.uid = document.id;
      coordinatesPuzzlesToReturn.push(themeToAdd);
    });

    return coordinatesPuzzlesToReturn;

  }

  async addCoordinatesPuzzle(coordinatesPuzzle: CoordinatesPuzzle): Promise<string> {
    const docRef = await addDoc(collection(this.db, 'coordinatesPuzzles'), coordinatesPuzzle);
    return docRef.id;
  }



  /**
   // ----------------------------------------------------------------------------
    Puzzles
   */

  async getPuzzlesByElo(eloStart: number, eloEnd: number) {

    const minRandom = randomNumber();
    const puzzlesToReturn: Puzzle[] = [];
    const q = query(
      collection(this.db, 'puzzles'),
      where('randomNumberQuery', '>=', minRandom),
      limit(200)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((document) => {
      const puzzleToAdd = document.data() as Puzzle;
      puzzleToAdd.uid = document.id;
      if (puzzleToAdd.rating >= eloStart && puzzleToAdd.rating <= eloEnd) {
        puzzlesToReturn.push(puzzleToAdd);
      }
    });

    return puzzlesToReturn;
  }


  //------- Admin only

  async adminAddNewPuzzle(puzzleToAdd: Puzzle): Promise<string> {
    await setDoc(doc(this.db, 'puzzles', puzzleToAdd.uid), puzzleToAdd);
    return puzzleToAdd.uid;
  }



}
