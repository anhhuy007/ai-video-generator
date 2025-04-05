type User = {
  name: string 
  email: string
  image: string
}

type Session = {
  user: User
  expires: string
}

export type { User, Session }
