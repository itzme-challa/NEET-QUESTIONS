import { useState } from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [year, setYear] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [testId, setTestId] = useState('');
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'waheedchalla' && password === 'waheed123') {
      setIsAuthenticated(true);
      setMessage('Login successful!');
      setMessageType('success');
    } else {
      setMessage('Invalid username or password.');
      setMessageType('error');
    }
  };

  const convertToJson = () => {
    setMessage('');
    setOutputJson('');
    if (!inputJson.trim()) {
      setMessage('Error: Input JSON is empty.');
      setMessageType('error');
      return;
    }

    try {
      // Replace escaped quotes and remove trailing commas
      let cleanedText = inputJson.replace(/\\"/g, '"').replace(/,\s*(\]|\})/g, '$1');
      const jsonObject = JSON.parse(cleanedText);
      const formattedJson = JSON.stringify(jsonObject, null, 2);
      setOutputJson(formattedJson);
      setMessage('Successfully converted to JSON!');
      setMessageType('success');
    } catch (error) {
      setMessage(`Error: Invalid JSON format. ${error.message}`);
      setMessageType('error');
    }
  };

  const copyToClipboard = () => {
    if (!outputJson) {
      setMessage('Error: No JSON to copy.');
      setMessageType('error');
      return;
    }

    navigator.clipboard.writeText(outputJson).then(() => {
      setMessage('JSON copied to clipboard!');
      setMessage
