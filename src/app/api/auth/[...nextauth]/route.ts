import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

const handler = NextAuth({
  providers: [ 
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              return null;
            } else if (response.status >= 500) {
              return null;
            }
          }
          
          const result = await response.json();

          if (result.success && result.data?.user) {
            const user = result.data.user;
            const authUser = {
              id: user.id.toString(),
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              userType: result.data.userType,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              address: user.address,
              country: user.country,
              accessToken: result.data.access_token,
              ...(result.data.userType === 'customer' && {
                city: user.city,
              }),
              ...(result.data.userType === 'partner' && {
                serviceType: user.serviceType,
                description: user.description,
                hourlyRate: user.hourlyRate,
                photo: user.photo,
                cities: user.cities,
              }),
            };
            return authUser;
          }

          return null;
        } catch (error) {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.address = user.address;
        token.country = user.country;
        token.accessToken = user.accessToken;
        
        if (user.userType === 'customer') {
          token.city = user.city;
        }
        
        if (user.userType === 'partner') {
          token.serviceType = user.serviceType;
          token.description = user.description;
          token.hourlyRate = user.hourlyRate;
          token.photo = user.photo;
          token.cities = user.cities;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        session.user.address = token.address as string;
        session.user.country = token.country as string;
        session.accessToken = token.accessToken as string;
        
        if (token.userType === 'customer') {
          session.user.city = token.city as string;
        }
        
        if (token.userType === 'partner') {
          session.user.serviceType = token.serviceType as string;
          session.user.description = token.description as string;
          session.user.hourlyRate = token.hourlyRate as number;
          session.user.photo = token.photo as string;
          session.user.cities = token.cities as string[];
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST }