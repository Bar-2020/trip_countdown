import './App.css'
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import Confetti from 'react-confetti'
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import {useState} from "react";
import {useWindowSize} from "react-use";
import { fromZonedTime } from 'date-fns-tz'

// const GREECE_TAKEOFF = '2025-09-06 05:00:00'
const CZECH_REPUBLIC_TAKEOFF = '2025-12-15 11:00:00'


const takeoffDate = fromZonedTime(CZECH_REPUBLIC_TAKEOFF, 'Asia/Jerusalem')

function App() {
    const [isExploding, setIsExploding] = useState(false)
    const { width, height } = useWindowSize()

    const startExploding = () => {setIsExploding(true)}

    // @ts-ignore
    return (
        <div
            style={{
                backgroundImage: 'url(/czechia.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.8,
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                boxSizing: 'border-box',
            }}
        >
            <div style={{
                borderRadius: '0.5rem',
                padding: width > 600 ? '2rem' : '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '90%',
                maxWidth: '500px',
            }}>
                <h1 style={{
                    color: 'black',
                    textAlign: 'center',
                    fontSize: width > 600 ? '2rem' : '1.3rem',
                    margin: width > 600 ? '0 0 1.5rem 0' : '0 0 1rem 0'
                }}>
                    Ella and Bar's Czech Republic Countdown!!! ❤️🪿
                </h1>
                <FlipClockCountdown 
                    to={takeoffDate} 
                    onComplete={startExploding} 
                    hideOnComplete={false}
                    labelStyle={{ color: 'black' }}
                    style={{ 
                        fontSize: width > 600 ? '0.9rem' : '0.45rem',
                        '--fcc-digit-block-width': width > 600 ? '40px' : '30px',
                    }}
                />
            </div>
            {isExploding && <Confetti
                width={width}
                height={height}
            />}
        </div>
    )
}

export default App