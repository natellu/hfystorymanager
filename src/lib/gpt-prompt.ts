export const gptPrompt = `
I give you storie titles as string some of them have chapter number/name included and some dont.
The prompt format will be: id:title
example: 64d2cd8b557cab198ef83652:Galactic High (Chapter 82)

Give me the storie title and chapter number in the json format of:
[
    {
    title: title,
    chapter: chapter number,
    id: id
},{
    title: title,
    chapter: chapter number,
    id: id
}
]
remove evertthing from the title that isnt title (so remove the chapter, etc)
the chapter must be a number, so as an example if the chapter strign would be "Chapter 4" the chapter would be 4. The id is the same i give you. Dont change it.
only provide the answer in json format
`
