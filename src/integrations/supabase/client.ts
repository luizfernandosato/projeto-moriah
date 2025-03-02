
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kijrprhxixsvnyqljwaz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpanJwcmh4aXhzdm55cWxqd2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MTEyNzMsImV4cCI6MjA1NjA4NzI3M30.C74uYTKOIM1YP-A6CcGuo5HE-0mNE20HSdptTDngs0c";

// Define a custom type that extends the Database type with our new tables
export type CustomDatabase = Database & {
  public: {
    Tables: {
      recebedores_favoritos: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          cpf_cnpj: string;
          rua: string;
          numero: string;
          bairro: string;
          cidade: string;
          estado: string;
          complemento: string | null;
          cep: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          cpf_cnpj: string;
          rua: string;
          numero: string;
          bairro: string;
          cidade: string;
          estado: string;
          complemento?: string | null;
          cep: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          cpf_cnpj?: string;
          rua?: string;
          numero?: string;
          bairro?: string;
          cidade?: string;
          estado?: string;
          complemento?: string | null;
          cep?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recebedores_favoritos_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      pagadores_favoritos: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          cpf_cnpj: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          cpf_cnpj: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          cpf_cnpj?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pagadores_favoritos_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    } & Database["public"]["Tables"];
  } & Database["public"];
};

export const supabase = createClient<CustomDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
