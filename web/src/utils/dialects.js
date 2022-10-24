const international = {
	name: "international",
  short_name: "",
	table: {
		".-": "a",
		"-...": "b",
		"-.-.": "c",
		"-..": "d",
		".": "e",
		"..-.": "f",
		"--.": "g",
		"....": "h",
		"..": "i",
		".---": "j",
		"-.-": "k",
		".-..": "l",
		"--": "m",
		"-.": "n",
		"---": "o",
		".--.": "p",
		"--.-": "q",
		".-.": "r",
		"...": "s",
		"-": "t",
		"..-": "u",
		"...-": "v",
		".--": "w",
		"-..-": "x",
		"-.--": "y",
		"--..": "z",
		".-.-.-": ".",
		"--..--": ",",
		"..--..": "?",
		".----.": "\'",
		"-.-.--": "!",
		"-..-.": "/",
		"---...": ":",
		"-.-.-.": ";",
		"-...-": "=",
		"-....-": "-",
		".-.-.": "+",
		".--.-.": "@",
		".----": "1",
		"..---": "2",
		"...--": "3",
		"....-": "4",
		".....": "5",
		"-....": "6",
		"--...": "7",
		"---..": "8",
		"----.": "9",
		"-----": "0",
	}
}

const russian = {
  name: "russian",
  short_name: "RU",
  table: {
		".-": "A",
		"-...": "Б",
		".--": "В",
		"--.": "Г",
		"-..": "Д",
		".": "Е",
		"...-": "Ж",
		"--..": "З",
		"..": "И",
		".---": "Й",
		"-.-": "К",
		".-..": "Л",
		"--": "М",
		"-.": "H",
		"---": "О",
		".--.": "П",
		".-.": "P",
		"...": "С",
		"-": "Т",
		"..-": "У",
		"..-.": "Ф",
		"....": "Х",
		"-.-.": "Ц",
		"---.": "Ч",
		"----": "Ш",
		"--.-": "Щ",
		"-..-": "Ь",
		"-.--": "Ы",
		"..-..": "Э",
		"..--": "Ю",
		".-.-": "Я",
		
		"......": ".",
		".-.-.-": ",",
		"..--..": "?",
		".----.": "'",
		".-..-.": "\"",
		"--..--": "!",
		"-..-.": "/",
		"---...": ":",
		"-.-.-": ";",
		"-.--.-": ")",
		"-...-": "=",
		"-....-": "-",
		"-...-": "-",
		"..--.-": "_",
		".-.-.": "+",
		".--.-.": "@",
		".----": "1",
		"..---": "2",
		"...--": "3",
		"....-": "4",
		".....": "5",
		"-....": "6",
		"--...": "7",
		"---..": "8",
		"----.": "9",
    "-----": "0",  
  }
}

export const dialects = {
	international,
  russian
}

export default function getDialect(dialect){
	if(dialects.hasOwnProperty(dialect)){
		return dialects[dialect]
	}else{
		return dialects["international"]
	}
}
