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
  const [activeTab, setActiveTab] = useState('json-converter'); // Default to JSON Converter tab
  const [year, setYear] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [testId, setTestId] = useState('');
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [testJson, setTestJson] = useState('');
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
      setMessageType('success');
    }).catch((err) => {
      setMessage(`Error copying to clipboard: ${err}`);
      setMessageType('error');
    });
  };

  const generateRandomId = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const downloadJson = () => {
    if (!outputJson) {
      setMessage('Error: No JSON to download.');
      setMessageType('error');
      return;
    }

    try {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const randomId = generateRandomId();
      const filename = `${day}${month}${year}_${randomId}.json`;

      const blob = new Blob([outputJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      setMessage(`JSON downloaded as ${filename}!`);
      setMessageType('success');
    } catch (error) {
      setMessage(`Error downloading file: ${error}`);
      setMessageType('error');
    }
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    if (!year || !name || !date || !testId || !testJson) {
      setMessage('Error: All fields and valid JSON are required.');
      setMessageType('error');
      return;
    }

    try {
      // Validate JSON
      const jsonObject = JSON.parse(testJson);

      // Save test metadata to Firebase
      await set(ref(database, `tests/${year}/${testId}`), {
        name,
        date
      });

      // Save JSON questions to Firebase
      await set(ref(database, `data/${testId}`), jsonObject);

      setMessage(`Test ${name} added successfully to Firebase!`);
      setMessageType('success');
      setYear('');
      setName('');
      setDate('');
      setTestId('');
      setTestJson('');
    } catch (error) {
      setMessage(`Error saving to Firebase: ${error.message}`);
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setMessage('Logged out successfully.');
    setMessageType('success');
    setActiveTab('json-converter');
  };

  return (
    <div className="container">
      <Head>
        <title>PW ONLINE - Admin Panel</title>
      </Head>

      <header className="header">
        <div className="branding">
          <img src="/logo.png" alt="PW ONLINE Logo" className="logo" />
          <div className="branding-text">
            <h1 className="website-name">PW ONLINE</h1>
            <p className="website-subname">EDUHUB-KMR</p>
          </div>
        </div>
        {isAuthenticated && (
          <div className="profile">
            <button onClick={handleLogout} className="btn btn-error" title="Logout">
              <i className="fas fa-sign-out-alt"></i>
              <span className="btn-text">Logout</span>
            </button>
          </div>
        )}
      </header>

      <div className="max-container">
        <h2 className="page-title">Admin Panel</h2>

        {!isAuthenticated ? (
          <div className="popup">
            <div className="popup-content">
              <h3 className="popup-title">Admin Login</h3>
              <form onSubmit={handleLogin}>
                <div className="input-container">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="input-field"
                    required
                  />
                </div>
                <div className="input-container">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="input-field"
                    required
                  />
                </div>
                <div className="popup-buttons">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-sign-in-alt"></i>
                    <span className="btn-text">Login</span>
                  </button>
                </div>
              </form>
              {message && <div className={messageType}>{message}</div>}
            </div>
          </div>
        ) : (
          <div>
            <div className="tab-container">
              <button
                className={`tab-btn ${activeTab === 'json-converter' ? 'tab-btn-active' : ''}`}
                onClick={() => setActiveTab('json-converter')}
              >
                JSON Converter
              </button>
              <button
                className={`tab-btn ${activeTab === 'add-test' ? 'tab-btn-active' : ''}`}
                onClick={() => setActiveTab('add-test')}
              >
                Add Test to Firebase
              </button>
            </div>

            {activeTab === 'json-converter' && (
              <div className="section">
                <h3 className="popup-title">JSON Converter</h3>
                <div className="input-container">
                  <textarea
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    placeholder="Paste your JSON-like text here..."
                    className="input-field"
                    rows={10}
                  ></textarea>
                </div>
                <div className="button-container">
                  <button type="button" onClick={convertToJson} className="btn btn-primary">
                    <i className="fas fa-cogs"></i>
                    <span className="btn-text">Convert to JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="btn btn-secondary"
                    style={{ display: outputJson ? 'flex' : 'none' }}
                  >
                    <i className="fas fa-copy"></i>
                    <span className="btn-text">Copy to Clipboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadJson}
                    className="btn btn-gray"
                    style={{ display: outputJson ? 'flex' : 'none' }}
                  >
                    <i className="fas fa-download"></i>
                    <span className="btn-text">Download JSON</span>
                  </button>
                </div>
                <div className="input-container">
                  <div
                    className="output"
                    style={{
                      backgroundColor: 'white',
                      padding: '15px',
                      border: '1px solid #ccc',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      minHeight: '200px'
                    }}
                  >
                    {outputJson || 'Converted JSON will appear here...'}
                  </div>
                </div>
                {message && activeTab === 'json-converter' && (
                  <div className={messageType}>{message}</div>
                )}
              </div>
            )}

            {activeTab === 'add-test' && (
              <div className="section">
                <h3 className="popup-title">Add New Test to Firebase</h3>
                <form onSubmit={handleSubmitTest}>
                  <div className="input-container">
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="Year (e.g., 2025)"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="input-container">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Test Name"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="input-container">
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="Date (e.g., 2025-07-11)"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="input-container">
                    <input
                      type="text"
                      value={testId}
                      onChange={(e) => setTestId(e.target.value)}
                      placeholder="Test ID (e.g., test123)"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="input-container">
                    <textarea
                      value={testJson}
                      onChange={(e) => setTestJson(e.target.value)}
                      placeholder="Paste your valid JSON here..."
                      className="input-field"
                      rows={10}
                    ></textarea>
                  </div>
                  <div className="button-container">
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save"></i>
                      <span className="btn-text">Add Test to Firebase</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="btn btn-gray"
                    >
                      <i className="fas fa-home"></i>
                      <span className="btn-text">Back to Home</span>
                    </button>
                  </div>
                </form>
                {message && activeTab === 'add-test' && (
                  <div className={messageType}>{message}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .tab-container {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
        }
        .tab-btn {
          padding: 10px 20px;
          background-color: #e0e0e0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }
        .tab-btn:hover {
          background-color: #d0d0d0;
        }
        .tab-btn-active {
          background-color: #007bff;
          color: white;
        }
        .tab-btn-active:hover {
          background-color: #0056b3;
        }
        .section {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
