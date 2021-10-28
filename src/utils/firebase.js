import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore'
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOYfLpH4NWjjC1WiOTsFlIWnCgvlDrRbc",
  authDomain: "vs-rogue.firebaseapp.com",
  projectId: "vs-rogue",
  storageBucket: "vs-rogue.appspot.com",
  messagingSenderId: "516834065773",
  appId: "1:516834065773:web:099c0204abdbceead32e64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

const loadMap = async (mapName) => {
  const mapSnap = await getDoc(doc(firestore, 'maps', mapName))
  if (mapSnap.exists()) {
    // Successfully loaded map.
    return {...mapSnap.data(), title: mapSnap.id};
  } else return null
}

// Save a map to firestore.
const saveMap = async (map) => {
  for (let i = 0; i < map.tiles.length; i++)
    if (typeof map.tiles[i] !== 'string') map.tiles[i] = ''

  await setDoc(doc(firestore, 'maps', map.title), map)
}

const getItems = async (item) => {
  if (item) {
    // Optionally load just 1 item
    const itemSnap = await getDoc(doc(firestore, 'items', item))
    if (itemSnap.exists()) {
      return {...itemSnap.data(), title: itemSnap.id};
    } else return null
  } else {
    // Otherwise get all item data
    const itemsSnap = await getDocs(collection(firestore, 'items'))
    var items = []
    itemsSnap.forEach(doc => {
      items.push({...doc.data(), title: doc.id})
    })
    return items
  }
}

const getUserData = async (uid) => {
  const userDataSnap = await getDoc(doc(firestore, 'userData', uid))
  if (userDataSnap.exists()) return userDataSnap.data()
  else return null
}

/**
 * Creates/updates user data, indexed by UID.
 * @param {*} uid - Unique UID
 * @param {*} data - Data to save for user.
 */
const setUserData = async (uid, data) => {
  await setDoc(doc(firestore, 'userData', uid), data)
  console.log('💾 Progress saved.')
}

module.exports = { auth, firestore, loadMap, saveMap, getItems, getUserData, setUserData }