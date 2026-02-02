export interface IDog {
    id: number | undefined | null
    name: string,
    breed: string,
    gender: boolean | string,
    age: number | string | null
    picurl: string | null
}

export default class Dog implements IDog {
    id: number | undefined | null
    name: string = ""
    breed: string = ""
    gender: boolean = false
    age: number | null = null
    picurl: string | null = null
   
     constructor(init: IDog) {
          Object.assign(this, init as Partial<Dog>)        
   }
  
} 