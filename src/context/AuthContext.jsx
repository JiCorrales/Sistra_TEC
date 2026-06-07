import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    // Obtener sesión actual
    async function getSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if(session) {
        const { data: profile } =
          await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', session.user.id)
            .single()

        setUser({
          ...session.user,
          profile
        })
      }

      setLoading(false)
    }

    getSession()

    // Escuchar cambios de sesión
    const {
      data: listener
    } = supabase.auth.onAuthStateChange(
      async (_, session) => {

        if(session) {

          const { data: profile } =
            await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', session.user.id)
              .single()

          setUser({
            ...session.user,
            profile
          })

        } else {

          setUser(null)
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

