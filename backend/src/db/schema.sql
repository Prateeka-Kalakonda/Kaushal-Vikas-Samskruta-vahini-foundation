--
-- PostgreSQL database dump
--

\restrict xTeLdC4fC5b3uK7hsU4z7mmdXzpOJQsLmV3qIDE67F3mhA0Y1yW1xTYA3xKd97C

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(500) NOT NULL,
    message text NOT NULL,
    created_by uuid NOT NULL,
    target_role character varying(20) DEFAULT 'all'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT announcements_target_role_check CHECK (((target_role)::text = ANY ((ARRAY['student'::character varying, 'mentor'::character varying, 'admin'::character varying, 'all'::character varying])::text[])))
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookmarks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    content_block_id uuid NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.bookmarks OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    icon character varying(100),
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapters (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lesson_id uuid NOT NULL,
    title character varying(500) NOT NULL,
    chapter_num integer,
    ncert_ref character varying(100),
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.chapters OWNER TO postgres;

--
-- Name: content_blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_blocks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    chapter_id uuid NOT NULL,
    block_type character varying(50) NOT NULL,
    title character varying(500),
    content jsonb,
    order_index integer DEFAULT 0 NOT NULL,
    language character varying(10) DEFAULT 'en'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_blocks_block_type_check CHECK (((block_type)::text = ANY ((ARRAY['text'::character varying, 'video'::character varying, 'simulation'::character varying, 'image'::character varying, 'formula'::character varying, 'diagram'::character varying, 'quiz'::character varying])::text[])))
);


ALTER TABLE public.content_blocks OWNER TO postgres;

--
-- Name: experiments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.experiments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subject_id uuid,
    chapter_id uuid,
    simulation_id uuid,
    title character varying(500) NOT NULL,
    description text,
    experiment_type character varying(50) DEFAULT 'virtual'::character varying,
    difficulty character varying(20) DEFAULT 'medium'::character varying,
    duration_mins integer DEFAULT 30,
    materials jsonb,
    procedure jsonb,
    expected_results text,
    safety_notes text,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT experiments_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))),
    CONSTRAINT experiments_experiment_type_check CHECK (((experiment_type)::text = ANY ((ARRAY['virtual'::character varying, 'physical'::character varying, 'hybrid'::character varying])::text[])))
);


ALTER TABLE public.experiments OWNER TO postgres;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    topic_id uuid NOT NULL,
    title character varying(500) NOT NULL,
    slug character varying(500) NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- Name: mentor_activity_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mentor_activity_log (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mentor_id uuid NOT NULL,
    student_id uuid NOT NULL,
    action_type character varying(50) DEFAULT 'view_progress'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT mentor_activity_log_action_type_check CHECK (((action_type)::text = ANY ((ARRAY['view_progress'::character varying, 'add_note'::character varying, 'message'::character varying])::text[])))
);


ALTER TABLE public.mentor_activity_log OWNER TO postgres;

--
-- Name: mentor_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mentor_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    subject character varying(100),
    qualification character varying(255),
    experience integer DEFAULT 0,
    bio text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.mentor_profiles OWNER TO postgres;

--
-- Name: mentor_student_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mentor_student_assignments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mentor_id uuid NOT NULL,
    student_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid
);


ALTER TABLE public.mentor_student_assignments OWNER TO postgres;

--
-- Name: reading_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reading_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    last_block_id uuid,
    progress_pct integer DEFAULT 0,
    completed boolean DEFAULT false,
    last_read_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reading_progress_progress_pct_check CHECK (((progress_pct >= 0) AND (progress_pct <= 100)))
);


ALTER TABLE public.reading_progress OWNER TO postgres;

--
-- Name: simulation_interactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.simulation_interactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    simulation_id uuid NOT NULL,
    session_data jsonb,
    duration_sec integer DEFAULT 0,
    interacted_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.simulation_interactions OWNER TO postgres;

--
-- Name: simulation_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.simulation_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    simulation_id uuid NOT NULL,
    title character varying(500),
    content text NOT NULL,
    note_type character varying(50) DEFAULT 'theory'::character varying,
    order_index integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT simulation_notes_note_type_check CHECK (((note_type)::text = ANY ((ARRAY['theory'::character varying, 'formula'::character varying, 'observation'::character varying, 'tip'::character varying, 'warning'::character varying])::text[])))
);


ALTER TABLE public.simulation_notes OWNER TO postgres;

--
-- Name: simulations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.simulations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    chapter_id uuid NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    sim_type character varying(100) NOT NULL,
    renderer character varying(50) DEFAULT 'threejs'::character varying,
    config jsonb NOT NULL,
    thumbnail_url character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    topic_id uuid,
    difficulty character varying(20) DEFAULT 'medium'::character varying,
    duration_mins integer DEFAULT 15,
    tags jsonb DEFAULT '[]'::jsonb,
    theory text,
    how_to_use text,
    learning_outcomes text,
    CONSTRAINT simulations_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))),
    CONSTRAINT simulations_renderer_check CHECK (((renderer)::text = ANY ((ARRAY['threejs'::character varying, 'p5js'::character varying, 'canvas'::character varying, 'webgl'::character varying, 'custom'::character varying])::text[])))
);


ALTER TABLE public.simulations OWNER TO postgres;

--
-- Name: student_experiment_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_experiment_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    experiment_id uuid NOT NULL,
    progress_pct integer DEFAULT 0,
    completed boolean DEFAULT false,
    started_at timestamp with time zone DEFAULT now(),
    last_updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_experiment_progress_progress_pct_check CHECK (((progress_pct >= 0) AND (progress_pct <= 100)))
);


ALTER TABLE public.student_experiment_progress OWNER TO postgres;

--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    age integer,
    class_level integer,
    parent_mobile character varying(15),
    school_name character varying(255),
    board character varying(50) DEFAULT 'CBSE'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_profiles_age_check CHECK (((age >= 14) AND (age <= 20))),
    CONSTRAINT student_profiles_board_check CHECK (((board)::text = ANY ((ARRAY['CBSE'::character varying, 'ICSE'::character varying, 'State'::character varying])::text[]))),
    CONSTRAINT student_profiles_class_level_check CHECK ((class_level = ANY (ARRAY[11, 12])))
);


ALTER TABLE public.student_profiles OWNER TO postgres;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    class_level integer NOT NULL,
    description text,
    icon_url character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    category_id uuid,
    CONSTRAINT subjects_class_level_check CHECK ((class_level = ANY (ARRAY[11, 12])))
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subject_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- Name: translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    language character varying(10) NOT NULL,
    field_name character varying(100) NOT NULL,
    translated_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT translations_language_check CHECK (((language)::text = ANY ((ARRAY['en'::character varying, 'hi'::character varying, 'te'::character varying])::text[])))
);


ALTER TABLE public.translations OWNER TO postgres;

--
-- Name: user_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    content_block_id uuid NOT NULL,
    highlighted_text text,
    note_text text,
    color character varying(20) DEFAULT 'yellow'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_notes OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'student'::character varying NOT NULL,
    language character varying(10) DEFAULT 'en'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    username character varying(100),
    mobile_no character varying(15),
    avatar_url character varying(500),
    CONSTRAINT users_language_check CHECK (((language)::text = ANY ((ARRAY['en'::character varying, 'hi'::character varying, 'te'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'admin'::character varying, 'mentor'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (id);


--
-- Name: bookmarks bookmarks_user_id_content_block_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_content_block_id_key UNIQUE (user_id, content_block_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- Name: content_blocks content_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_blocks
    ADD CONSTRAINT content_blocks_pkey PRIMARY KEY (id);


--
-- Name: experiments experiments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: mentor_activity_log mentor_activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_activity_log
    ADD CONSTRAINT mentor_activity_log_pkey PRIMARY KEY (id);


--
-- Name: mentor_profiles mentor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_profiles
    ADD CONSTRAINT mentor_profiles_pkey PRIMARY KEY (id);


--
-- Name: mentor_profiles mentor_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_profiles
    ADD CONSTRAINT mentor_profiles_user_id_key UNIQUE (user_id);


--
-- Name: mentor_student_assignments mentor_student_assignments_mentor_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_student_assignments
    ADD CONSTRAINT mentor_student_assignments_mentor_id_student_id_key UNIQUE (mentor_id, student_id);


--
-- Name: mentor_student_assignments mentor_student_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_student_assignments
    ADD CONSTRAINT mentor_student_assignments_pkey PRIMARY KEY (id);


--
-- Name: reading_progress reading_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_pkey PRIMARY KEY (id);


--
-- Name: reading_progress reading_progress_user_id_chapter_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_user_id_chapter_id_key UNIQUE (user_id, chapter_id);


--
-- Name: simulation_interactions simulation_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_interactions
    ADD CONSTRAINT simulation_interactions_pkey PRIMARY KEY (id);


--
-- Name: simulation_notes simulation_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_notes
    ADD CONSTRAINT simulation_notes_pkey PRIMARY KEY (id);


--
-- Name: simulations simulations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulations
    ADD CONSTRAINT simulations_pkey PRIMARY KEY (id);


--
-- Name: student_experiment_progress student_experiment_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_experiment_progress
    ADD CONSTRAINT student_experiment_progress_pkey PRIMARY KEY (id);


--
-- Name: student_experiment_progress student_experiment_progress_user_id_experiment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_experiment_progress
    ADD CONSTRAINT student_experiment_progress_user_id_experiment_id_key UNIQUE (user_id, experiment_id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_slug_key UNIQUE (slug);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: translations translations_entity_type_entity_id_language_field_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_entity_type_entity_id_language_field_name_key UNIQUE (entity_type, entity_id, language, field_name);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: user_notes user_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_announcements_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_role ON public.announcements USING btree (target_role);


--
-- Name: idx_bookmarks_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookmarks_user ON public.bookmarks USING btree (user_id);


--
-- Name: idx_chapters_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chapters_lesson_id ON public.chapters USING btree (lesson_id);


--
-- Name: idx_content_blocks_chapter_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_blocks_chapter_id ON public.content_blocks USING btree (chapter_id);


--
-- Name: idx_experiments_chapter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_experiments_chapter ON public.experiments USING btree (chapter_id);


--
-- Name: idx_experiments_subject; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_experiments_subject ON public.experiments USING btree (subject_id);


--
-- Name: idx_lessons_topic_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_topic_id ON public.lessons USING btree (topic_id);


--
-- Name: idx_mentor_activity_mentor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mentor_activity_mentor ON public.mentor_activity_log USING btree (mentor_id);


--
-- Name: idx_mentor_activity_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mentor_activity_student ON public.mentor_activity_log USING btree (student_id);


--
-- Name: idx_mentor_assignments_mentor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mentor_assignments_mentor ON public.mentor_student_assignments USING btree (mentor_id);


--
-- Name: idx_mentor_assignments_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mentor_assignments_student ON public.mentor_student_assignments USING btree (student_id);


--
-- Name: idx_reading_progress_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_user ON public.reading_progress USING btree (user_id);


--
-- Name: idx_simulation_notes_sim; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_simulation_notes_sim ON public.simulation_notes USING btree (simulation_id);


--
-- Name: idx_simulations_chapter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_simulations_chapter ON public.simulations USING btree (chapter_id);


--
-- Name: idx_simulations_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_simulations_topic ON public.simulations USING btree (topic_id);


--
-- Name: idx_student_exp_progress_exp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_exp_progress_exp ON public.student_experiment_progress USING btree (experiment_id);


--
-- Name: idx_student_exp_progress_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_exp_progress_user ON public.student_experiment_progress USING btree (user_id);


--
-- Name: idx_subjects_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subjects_category ON public.subjects USING btree (category_id);


--
-- Name: idx_topics_subject_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_topics_subject_id ON public.topics USING btree (subject_id);


--
-- Name: idx_translations_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_translations_entity ON public.translations USING btree (entity_type, entity_id, language);


--
-- Name: idx_user_notes_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notes_user ON public.user_notes USING btree (user_id);


--
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: bookmarks bookmarks_content_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_content_block_id_fkey FOREIGN KEY (content_block_id) REFERENCES public.content_blocks(id) ON DELETE CASCADE;


--
-- Name: bookmarks bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chapters chapters_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: content_blocks content_blocks_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_blocks
    ADD CONSTRAINT content_blocks_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: experiments experiments_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE SET NULL;


--
-- Name: experiments experiments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: experiments experiments_simulation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_simulation_id_fkey FOREIGN KEY (simulation_id) REFERENCES public.simulations(id) ON DELETE SET NULL;


--
-- Name: experiments experiments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;


--
-- Name: lessons lessons_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: mentor_activity_log mentor_activity_log_mentor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_activity_log
    ADD CONSTRAINT mentor_activity_log_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mentor_activity_log mentor_activity_log_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_activity_log
    ADD CONSTRAINT mentor_activity_log_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mentor_profiles mentor_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_profiles
    ADD CONSTRAINT mentor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mentor_student_assignments mentor_student_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_student_assignments
    ADD CONSTRAINT mentor_student_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: mentor_student_assignments mentor_student_assignments_mentor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_student_assignments
    ADD CONSTRAINT mentor_student_assignments_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mentor_student_assignments mentor_student_assignments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_student_assignments
    ADD CONSTRAINT mentor_student_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reading_progress reading_progress_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: reading_progress reading_progress_last_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_last_block_id_fkey FOREIGN KEY (last_block_id) REFERENCES public.content_blocks(id);


--
-- Name: reading_progress reading_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: simulation_interactions simulation_interactions_simulation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_interactions
    ADD CONSTRAINT simulation_interactions_simulation_id_fkey FOREIGN KEY (simulation_id) REFERENCES public.simulations(id) ON DELETE CASCADE;


--
-- Name: simulation_interactions simulation_interactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_interactions
    ADD CONSTRAINT simulation_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: simulation_notes simulation_notes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_notes
    ADD CONSTRAINT simulation_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: simulation_notes simulation_notes_simulation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_notes
    ADD CONSTRAINT simulation_notes_simulation_id_fkey FOREIGN KEY (simulation_id) REFERENCES public.simulations(id) ON DELETE CASCADE;


--
-- Name: simulations simulations_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulations
    ADD CONSTRAINT simulations_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: simulations simulations_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulations
    ADD CONSTRAINT simulations_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;


--
-- Name: student_experiment_progress student_experiment_progress_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_experiment_progress
    ADD CONSTRAINT student_experiment_progress_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiments(id) ON DELETE CASCADE;


--
-- Name: student_experiment_progress student_experiment_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_experiment_progress
    ADD CONSTRAINT student_experiment_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subjects subjects_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: topics topics_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: user_notes user_notes_content_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_content_block_id_fkey FOREIGN KEY (content_block_id) REFERENCES public.content_blocks(id) ON DELETE CASCADE;


--
-- Name: user_notes user_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xTeLdC4fC5b3uK7hsU4z7mmdXzpOJQsLmV3qIDE67F3mhA0Y1yW1xTYA3xKd97C