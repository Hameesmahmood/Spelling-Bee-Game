import React, { useState, useEffect } from "react";
import {
  Play,
  HelpCircle,
  SkipForward,
  RefreshCw,
  Check,
  AlertTriangle,
  Clock,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const threeLetterWords: string[] = [
  "fit",
  "mad",
  "bus",
  "spy",
  "job",
  "row",
  "cat",
  "dog",
  "sun",
  "pen",
];
const fourLetterWords: string[] = [
  "dots",
  "moon",
  "star",
  "tree",
  "book",
  "ball",
  "gate",
  "ship",
  "fish",
  "lamp",
];
const alphabets: string[] = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

interface WordStatus {
  word: string;
  correct: boolean;
  attempted: boolean;
}

const SpellingBeeGame: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [wordStatus, setWordStatus] = useState<WordStatus[][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [studyList, setStudyList] = useState<string[]>([]);
  const [showStudyList, setShowStudyList] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  const levels = [alphabets, threeLetterWords, fourLetterWords];

  useEffect(() => {
    initializeWordStatus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);

  const initializeWordStatus = () => {
    const initialStatus = levels.map((level) =>
      level.map((word) => ({ word, correct: false, attempted: false }))
    );
    setWordStatus(initialStatus);
    setIsActive(true);
  };

  const getCurrentWord = (): string => {
    return wordStatus[currentLevel][currentWordIndex].word;
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const playWord = () => speak(getCurrentWord());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentWord = getCurrentWord();
    const isCorrect = userInput.toLowerCase() === currentWord.toLowerCase();

    setWordStatus((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[currentLevel][currentWordIndex] = {
        ...newStatus[currentLevel][currentWordIndex],
        correct: isCorrect,
        attempted: true,
      };
      return newStatus;
    });

    if (isCorrect) {
      setMessage("Correct! Well done!");
      setScore((prevScore) => prevScore + 1);
    } else {
      setMessage(`Incorrect. The correct spelling is "${currentWord}".`);
      addToStudyList(currentWord);
    }

    setUserInput("");
    nextWord();
  };

  const nextWord = () => {
    const currentLevelWords = wordStatus[currentLevel];
    let nextIndex = (currentWordIndex + 1) % currentLevelWords.length;

    // Check if all words in the current level are correct
    const allCorrect = currentLevelWords.every((word) => word.correct);

    if (allCorrect) {
      // Move to the next level if available
      if (currentLevel + 1 < levels.length) {
        setCurrentLevel((prevLevel) => prevLevel + 1);
        setCurrentWordIndex(0);
        setMessage(
          `Congratulations! You've moved to level ${currentLevel + 2}!`
        );
      } else {
        setMessage("Congratulations! You've completed all levels!");
        setIsActive(false);
      }
    } else {
      // Find the next unattempted or incorrect word
      while (
        nextIndex !== currentWordIndex &&
        currentLevelWords[nextIndex].correct
      ) {
        nextIndex = (nextIndex + 1) % currentLevelWords.length;
      }
      setCurrentWordIndex(nextIndex);
    }

    setShowHint(false);
  };

  const showHintHandler = () => setShowHint(true);

  const resetGame = () => {
    setCurrentLevel(0);
    setCurrentWordIndex(0);
    setScore(0);
    setMessage("");
    setShowHint(false);
    setUserInput("");
    setTimer(0);
    initializeWordStatus();
  };

  const skipWord = () => {
    addToStudyList(getCurrentWord());
    nextWord();
    setMessage("Word skipped. Try the next one!");
    setUserInput("");
  };

  const addToStudyList = (word: string) => {
    if (!studyList.includes(word)) {
      setStudyList((prevList) => [...prevList, word]);
    }
  };

  const removeFromStudyList = (word: string) => {
    setStudyList((prevList) => prevList.filter((w) => w !== word));
  };

  const clearStudyList = () => setStudyList([]);

  const totalWords = levels.flat().length;
  const correctWords = wordStatus.flat().filter((word) => word.correct).length;

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-4 ">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <Card className="w-auto">
            <CardContent className="flex items-center p-2">
              <Clock className="mr-2 h-5 w-5 text-purple-500" />
              <span className="font-semibold">{formatTime(timer)}</span>
            </CardContent>
          </Card>
          <Card className="w-auto">
            <CardContent className="flex items-center p-2">
              <Calendar className="mr-2 h-5 w-5 text-purple-500" />
              <span className="font-semibold">{currentDate}</span>
            </CardContent>
          </Card>
        </div>

        <h1 className="text-5xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          Spelling Bee
        </h1>

        <div className="mb-8">
          <Progress
            value={(correctWords / totalWords) * 100}
            className="h-3 bg-gray-200"
          />
          <p className="text-center mt-2 text-lg font-semibold text-purple-700">
            Score: {correctWords} / {totalWords}
          </p>
          <p className="text-center text-lg font-semibold text-purple-700">
            Level: {currentLevel + 1} ({currentLevel + 3}-letter words)
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <Button
            onClick={playWord}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Play className="mr-2 h-5 w-5" /> Play Word
          </Button>
          <Button
            onClick={showHintHandler}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <HelpCircle className="mr-2 h-5 w-5" /> Hint
          </Button>
          <Button
            onClick={skipWord}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <SkipForward className="mr-2 h-5 w-5" /> Skip
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex space-x-4">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your answer"
              className="flex-grow text-lg p-3 border-2 border-purple-300 focus:border-purple-500 rounded-lg"
            />
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg"
            >
              Submit
            </Button>
          </div>
        </form>

        {message && (
          <Alert
            variant={
              message.includes("Correct") || message.includes("Congratulations")
                ? "default"
                : "destructive"
            }
            className={`mb-6 ${
              message.includes("Correct") || message.includes("Congratulations")
                ? "bg-green-100 border-green-400"
                : "bg-red-100 border-red-400"
            }`}
          >
            {message.includes("Correct") ||
            message.includes("Congratulations") ? (
              <Check className="h-5 w-5 text-green-700" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-700" />
            )}
            <AlertTitle className="text-lg font-semibold">
              {message.includes("Correct") ||
              message.includes("Congratulations")
                ? "Success!"
                : "Oops!"}
            </AlertTitle>
            <AlertDescription className="text-base">{message}</AlertDescription>
          </Alert>
        )}

        {showHint && (
          <Alert className="mb-6 bg-yellow-100 border-yellow-400">
            <HelpCircle className="h-5 w-5 text-yellow-700" />
            <AlertTitle className="text-lg font-semibold text-yellow-700">
              Hint
            </AlertTitle>
            <AlertDescription className="text-base text-yellow-700">
              The word starts with: {getCurrentWord()[0]}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between mb-8">
          <Button
            onClick={resetGame}
            variant="outline"
            className="border-2 border-purple-500 text-purple-500 hover:bg-purple-50 rounded-lg"
          >
            <RefreshCw className="mr-2 h-5 w-5" /> Reset Game
          </Button>
          <Button
            onClick={() => setShowStudyList(!showStudyList)}
            variant="outline"
            className="border-2 border-purple-500 text-purple-500 hover:bg-purple-50 rounded-lg"
          >
            {showStudyList ? "Hide" : "Show"} Study List
          </Button>
        </div>

        {showStudyList && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold mb-4 text-purple-800">
              Study List
            </h2>
            {studyList.length === 0 ? (
              <p className="text-gray-600">Your study list is empty.</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {studyList.map((word, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-white p-3 rounded-lg shadow"
                    >
                      <span className="text-lg text-purple-700">{word}</span>
                      <Button
                        onClick={() => removeFromStudyList(word)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-500 hover:bg-red-50 rounded-full"
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={clearStudyList}
                  className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Clear Study List
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellingBeeGame;
