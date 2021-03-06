import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

import Item from '../models/Item'
import Map from '../models/Map'

// Firebase app config.
const firebaseConfig = {
  apiKey: 'AIzaSyAOYfLpH4NWjjC1WiOTsFlIWnCgvlDrRbc',
  authDomain: 'vs-rogue.firebaseapp.com',
  projectId: 'vs-rogue',
  storageBucket: 'vs-rogue.appspot.com',
  messagingSenderId: '516834065773',
  appId: '1:516834065773:web:099c0204abdbceead32e64'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firestore = getFirestore(app)

// Get a map from Firestore by name, or null if name doesn't exist in DB.
const getMap = async (mapName) => {
  const mapSnap = await getDoc(doc(firestore, 'maps', mapName))
  if (mapSnap.exists()) {
    // Successfully loaded map.
    return {...mapSnap.data(), title: mapSnap.id}
  } else return null
}

const normalizeMap = map => {
  let m = {...map}
  for (let i = 0; i < m.tiles.length; i++)
    if (m.tiles[i] instanceof Item) m.tiles[i] = JSON.parse(JSON.stringify(m.tiles[i]))
  return m
}

/**
 * Save a map to firestore.
 * @param {*} map - Map class.
 */
const saveMap = async (map) => {
  await setDoc(doc(firestore, 'maps', map.title), map)
}


/**
 * Load all item data (or optionally 1 item) from Firestore. 
 * @param {*} item - Item title.
 */
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

/**
 * Load user data from Firestore, or create new.
 * @param {*} uid - User UID
 */
const getUserData = async (uid) => {
  const userDataSnap = await getDoc(doc(firestore, 'userData', uid))
  
  if (userDataSnap.exists() && Object.keys(userDataSnap.data()).length !== 0) {
    console.log('???? User data found.')
    return userDataSnap.data()
  } else {
    console.log('No user data found. Creating new save...')
    let newUd = {
      icon: '?????????????',
      xp: 0,
      inventory: [],
      mapStates: {}
    }
    await setUserData(uid, newUd)
    return newUd
  }
}

/**
 * Creates/updates user data, indexed by UID.
 * @param {*} uid - Unique UID
 * @param {*} data - Data to save for user.
 */
const setUserData = async (uid, data) => {
  let tmpData = {...data}
  if (tmpData.mapStates?.[tmpData.currentMap]?.tiles.some(tile => tile instanceof Item)) {
    console.log('Current map needs normalized!')
    tmpData.mapStates[tmpData.currentMap] = normalizeMap(tmpData.mapStates[tmpData.currentMap])
  }
  await setDoc(doc(firestore, 'userData', uid), tmpData)
}

export { auth, firestore, getMap, saveMap, getItems, getUserData, setUserData }