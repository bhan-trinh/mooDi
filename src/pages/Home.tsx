import { NewAppScreen } from '@react-native/new-app-screen';
import { Button, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { NoteItem } from '../../models';
import { useCallback, useContext, useEffect, useState } from 'react';
import { createTable, delNoteItem, delTable, getDBConnection, getNoteItems, saveNoteItems } from '../services/db-service';
import styles from '../styles/styles';
import { NoteItemComponent } from '../components/NoteItem';
import Icon from '@react-native-vector-icons/fontawesome6';
import { NotesContext } from '../services/NoteContext';


export const Home = ({navigation}) => {
  const { notes, setNotes } = useContext(NotesContext)
  const [filteredNotes, setFilteredNotes] = useState<NoteItem[]>([])
  const [searchWord, setSearch] = useState('')

  const loadDataCallback = useCallback(async () => {
  try {
    const initNotes = [
      {
      id: 1, 
      value: "eat",
      datetime: new Date().toString(),
    },
    {
      id: 0,
      value: "i saw a squirrel today. i think i will bring nuts for it tomorrow, hopefully its at the same spot. im glad i have something to look forward to.",
      datetime: new Date().toString()
    }, 
    ]
    const db = await getDBConnection()
    await delTable(db)
    await createTable(db)
    const storedNoteItems = await getNoteItems(db)
    if (storedNoteItems.length){
      setNotes(storedNoteItems)
    } else {
      await saveNoteItems(db, initNotes);
      setNotes(initNotes)
    }

  } catch (error) {
    console.error(error)
  }
}, [])

useEffect(() => {
  console.log(`Home: ${notes}`)
    if (searchWord === '') setFilteredNotes(notes);

    // Find notes that match searched keywords
    var newNotes : NoteItem[] = []
    for (var note of notes){
      if (note.value.includes(searchWord)){
        newNotes.push(note)
      }
    }
  setFilteredNotes(newNotes)
  
},
  [notes, searchWord]
)

useEffect(() => {
  loadDataCallback()
}, [loadDataCallback])



  const delNote = async (id: number) => {
    try {
      const db = await getDBConnection()
      await delNoteItem(db, id);

      // Remove note from notes state variable
      setNotes((oldNotes) => {
        // If remove by using id as index, the pos in array and the actual id might be mismatched
        var newNotes = [...oldNotes]
        for (var i = 0; i < newNotes.length; i++){
          if (notes[i].id == id){
            newNotes.splice(i, 1)
            break
          }
        }

        return newNotes
    })
    } catch (error) {
      console.error(error)
    }
  }
  
    return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'>


      {/* Header */}
      <Text style={styles.welcomeText}>good morning.</Text>
              <TextInput
        style={[styles.textInput, styles.text]}
        value={searchWord}
        onChangeText={(text) => {
          setSearch(text)
        }}
        placeholder='search a word'
        />

        
        <TouchableOpacity style={styles.button} onPress={
        () => navigation.navigate('NewNote')
        }>
        <Text style={styles.buttonText}>+New</Text>
        </TouchableOpacity>

      {/* Notes */}
      <View style={styles.noteList}>
        {
        // If filtered notes lag behind
        (!filteredNotes.length && searchWord === '' ? notes : filteredNotes).map((note) => (
          <NoteItemComponent key={note.id} note={note} deleteItem={delNote}></NoteItemComponent> 
        ))}
      </View>

    </ScrollView>

    <View style={styles.botNavBar}>
        <Icon name="house" iconStyle='solid' size={30}/>
        <Icon name="user" iconStyle='solid' size={30}/>
    </View>
    </>
    )
    }