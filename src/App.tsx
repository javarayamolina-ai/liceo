import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  LogIn, 
  LogOut, 
  Plus, 
  Trash2,
  Menu,
  X,
  Instagram,
  ArrowRight,
  TrendingUp,
  Calendar,
  Grid,
  LayoutGrid,
  CheckCircle,
  XCircle,
  Globe,
  Compass,
  Flame,
  Lightbulb,
  Link2,
  Paperclip,
  UploadCloud,
  File as FileIcon
} from 'lucide-react';
import { auth, storage } from './lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { FirestoreService } from './lib/firestoreService';
import { Project, StudentWork, Material, Activity, Testimonial } from './types';
import { PolishedButton, PolishedCard, LiceoLogo, RetroCarousel, RetroConfirmProvider, useRetroConfirm } from './components/PolishedUI';
import { cn } from './lib/utils';
import muralImg from './assets/images/mural_brigada_ramona_parra_1781765930415.jpg';

const ASIGNATURAS = [
  "Ciencias Naturales",
  "Educación física",
  "Estudios sociales",
  "Inglés",
  "Instrumentales",
  "Lenguaje",
  "Matemáticas",
  "P.I.E. (Programa de Integración Escolar)",
  "Otros"
];

const CURSOS = [
  "Primer Nivel A",
  "Primer Nivel B",
  "Segundo Nivel A"
];

const ROLES = ['Estudiante', 'Apoderado/a', 'Egresado/a', 'Vecino/a', 'Profesor/a', 'Otro'];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'works' | 'materials' | 'activities' | 'about' | 'testimonials'>('about');
  const [projects, setProjects] = useState<Project[]>([]);
  const [works, setWorks] = useState<StudentWork[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);

  const handleOpenDetail = (item: any, type: 'projects' | 'works' | 'materials' | 'activities') => {
    const categoryLabel = type === 'projects' ? 'PROYECTOS' : type === 'works' ? 'CREACIONES ESTUDIANTILES' : type === 'materials' ? 'RECURSOS' : 'ACTIVIDADES';
    const categoryValue = type === 'projects' ? item.category : type === 'works' ? item.workType : type === 'materials' ? item.subject : item.category;
    setSelectedDetailItem({
      ...item,
      categoryLabel,
      categoryValue,
      parentType: type,
      description: type === 'works' ? (item.content || item.description) : (item.description || item.content),
    });
  };
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [isDemoAdmin, setIsDemoAdmin] = useState(false);

  useEffect(() => {
    setSelectedAsignatura(null);
    setSelectedCourse(null);
  }, [activeTab]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    
    const unsubProjects = FirestoreService.subscribeToCollection<Project>('projects', setProjects);
    const unsubWorks = FirestoreService.subscribeToCollection<StudentWork>('studentWorks', setWorks);
    const unsubMaterials = FirestoreService.subscribeToCollection<Material>('materials', setMaterials);
    const unsubActivities = FirestoreService.subscribeToCollection<Activity>('activities', setActivities);
    const unsubTestimonials = FirestoreService.subscribeToCollection<Testimonial>('testimonials', setTestimonials);

    return () => {
      unsubscribeAuth();
      unsubProjects();
      unsubWorks();
      unsubMaterials();
      unsubActivities();
      unsubTestimonials();
    };
  }, []);

  const adminEmails = ['crwom01@gmail.com', 'leps.vespertina.epja@gmail.com', 'jav.arayamolina@gmail.com'];
  const isAdmin = isDemoAdmin || (user?.email && adminEmails.includes(user.email));

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (email && !adminEmails.includes(email)) {
        await signOut(auth);
        alert("Acceso no autorizado. Este panel es exclusivo para administradores.");
      } else if (email && adminEmails.includes(email)) {
        setShowAdminDashboard(true);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setShowAdminDashboard(false);
  };

  const handleOpenForm = () => {
    setShowAdminDashboard(false);
    setShowForm(true);
    setTimeout(() => {
      const el = document.getElementById('new-content-form-anchor');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const fallback = document.getElementById('content-form-section');
        if (fallback) fallback.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleToggleForm = () => {
    const nextState = !showForm;
    setShowForm(nextState);
    if (nextState) {
      setTimeout(() => {
         const el = document.getElementById('content-form-section');
         if (el) {
           el.scrollIntoView({ behavior: 'smooth' });
         }
      }, 150);
    }
  };

  const handleFormSuccess = (subType: 'projects' | 'works' | 'materials' | 'activities') => {
    setShowForm(false);
    setActiveTab(subType);
    setTimeout(() => {
      const el = document.getElementById('content-form-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleTabChange = (tab: 'about' | 'projects' | 'works' | 'activities' | 'materials' | 'testimonials', isMobile = false) => {
    setActiveTab(tab);
    setShowAdminDashboard(false);
    setShowForm(false);
    if (isMobile) {
      setIsMenuOpen(false);
    }
    setTimeout(() => {
      if (tab === 'about') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById('content-form-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };

  // Helper: sort pinned items first, then by most recent
  const sortPinnedFirst = <T extends { pinned?: boolean; createdAt?: any }>(arr: T[]) =>
    [...arr].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const getMs = (dateObj: any) => {
        if (!dateObj) return 0;
        if (typeof dateObj.toMillis === 'function') return dateObj.toMillis();
        if (typeof dateObj.seconds === 'number') return dateObj.seconds * 1000;
        if (dateObj instanceof Date) return dateObj.getTime();
        if (typeof dateObj === 'string') return new Date(dateObj).getTime();
        return 0;
      };
      return getMs(b.createdAt) - getMs(a.createdAt);
    });

  // Content filters: Non-admins see approved content + their own pending posts. Rejected content is hidden from main view.
  const visibleProjects = sortPinnedFirst(projects.filter(p => (p.approved && !p.rejected) || (isAdmin && !p.rejected) || (user && p.authorId === user.uid && !p.rejected)));
  const visibleWorks = sortPinnedFirst(works.filter(w => (w.approved && !w.rejected) || (isAdmin && !w.rejected) || (user && w.authorId === user.uid && !w.rejected)));
  const visibleMaterials = sortPinnedFirst(materials.filter(m => (m.approved && !m.rejected) || (isAdmin && !m.rejected) || (user && m.authorId === user.uid && !m.rejected)));
  const visibleActivities = sortPinnedFirst(activities.filter(a => (a.approved && !a.rejected) || (isAdmin && !a.rejected) || (user && a.authorId === user.uid && !a.rejected)));
  const visibleTestimonials = sortPinnedFirst(testimonials.filter(t => t.approved && !t.rejected));

  const unapprovedCount = [
    ...projects.filter(p => !p.approved && !p.rejected),
    ...works.filter(w => !w.approved && !w.rejected),
    ...materials.filter(m => !m.approved && !m.rejected),
    ...activities.filter(a => !a.approved && !a.rejected)
  ].length;

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-black overflow-x-hidden w-full max-w-full">
      {/* Header */}
      <header className="bg-white border-b border-brand-border fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between px-6 md:px-12 py-2 md:py-2.5">
          <div 
            onClick={() => handleTabChange('about', true)}
            className="flex items-center gap-3 md:gap-4 shrink-0 cursor-pointer group select-none mr-4"
          >
            <LiceoLogo className="w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg lg:text-xl font-extrabold tracking-tighter uppercase leading-[1.05] flex flex-col group-hover:text-brand-red transition-colors">
                <span className="whitespace-nowrap">Liceo Eugenio</span>
                <span className="whitespace-nowrap font-black font-sans">Pereira Salas</span>
              </h1>
              <span className="text-[7.5px] md:text-[9px] font-mono tracking-widest text-brand-red uppercase mt-1">Jornada Vespertina</span>
            </div>
          </div>

          <nav className="hidden xl:flex shrink-0 items-center border-2 border-brand-black bg-white overflow-hidden divide-x-2 divide-brand-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mr-4">
            <NavButton active={activeTab === 'about'} onClick={() => handleTabChange('about')}>Inicio</NavButton>
            <NavButton active={activeTab === 'works'} onClick={() => handleTabChange('works')}>Creaciones estudiantiles</NavButton>
            <NavButton active={activeTab === 'projects'} onClick={() => handleTabChange('projects')}>Proyectos</NavButton>
            <NavButton active={activeTab === 'activities'} onClick={() => handleTabChange('activities')}>Actividades</NavButton>
            <NavButton active={activeTab === 'materials'} onClick={() => handleTabChange('materials')}>Recursos</NavButton>
            <NavButton active={activeTab === 'testimonials'} onClick={() => handleTabChange('testimonials')}>Testimonios</NavButton>
          </nav>

          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <PolishedButton 
              onClick={handleOpenForm}
              className="hidden md:flex flex-col items-center justify-center bg-brand-red text-white border-none text-[9px] py-2 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all shrink-0 leading-none gap-0.5 cursor-pointer font-black uppercase"
            >
              <div className="flex items-center gap-1 font-black">
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>SUBE TU</span>
              </div>
              <span className="font-black">CONTENIDO</span>
            </PolishedButton>

            <button className="xl:hidden cursor-pointer p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6 text-brand-red" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-b border-brand-border overflow-hidden z-40"
          >
            <div className="px-6 py-8 flex flex-col gap-4">
              <NavButton isMobile active={activeTab === 'about'} onClick={() => handleTabChange('about', true)}>Inicio</NavButton>
              <NavButton isMobile active={activeTab === 'works'} onClick={() => handleTabChange('works', true)}>Creaciones estudiantiles</NavButton>
              <NavButton isMobile active={activeTab === 'projects'} onClick={() => handleTabChange('projects', true)}>Proyectos</NavButton>
              <NavButton isMobile active={activeTab === 'activities'} onClick={() => handleTabChange('activities', true)}>Actividades</NavButton>
              <NavButton isMobile active={activeTab === 'materials'} onClick={() => handleTabChange('materials', true)}>Recursos</NavButton>
              <NavButton isMobile active={activeTab === 'testimonials'} onClick={() => handleTabChange('testimonials', true)}>Testimonios</NavButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col pt-[57px] md:pt-[69px]">
        {/* Modern Intro Section (Landing style) */}
        <div className="bg-brand-black text-white px-6 md:px-12 py-12 md:py-16 overflow-hidden relative border-b-8 border-brand-red">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            <motion.div
              className="lg:col-span-7 xl:col-span-7 text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-brand-red font-mono text-xs md:text-sm uppercase tracking-[0.4em] mb-4 md:mb-5 block font-bold">Pedro Aguirre Cerda, Chile | 2026</span>
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-6 md:mb-8">
                Miradas críticas hacia la <span className="text-brand-red">justicia social</span>
              </h2>
              <p className="text-lg md:text-2xl font-serif italic text-gray-300 leading-tight max-w-2xl mb-8 md:mb-10">
                "Un espacio digital para la educación pública de adultos y jóvenes."
              </p>
              <div className="flex flex-wrap gap-4">
                <PolishedButton onClick={handleOpenForm} className="w-full sm:w-auto bg-brand-red text-white hover:bg-white hover:text-black hover:scale-105 transition-all px-8 py-4 text-xs font-bold uppercase tracking-widest border-none shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <Plus className="w-5 h-5 mr-3" />
                  Sube tu Contenido
                </PolishedButton>
              </div>
            </motion.div>

            <motion.div 
              className="lg:col-span-5 xl:col-span-5 flex justify-center items-center lg:items-start lg:-mt-12 xl:-mt-20 w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* BRP Muralism Illustration Container */}
              <div className="relative w-full max-w-[340px] md:max-w-[420px] lg:max-w-[460px] aspect-square bg-white border-4 border-brand-red p-2.5 shadow-[10px_10px_0px_0px_rgba(188,33,34,1)] -rotate-1 hover:rotate-1 transition-all duration-500 group select-none md:mr-4 z-20">
                <div className="absolute -top-3 -left-3 bg-brand-red text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest px-3 py-1 z-10 border border-brand-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Comunidad
                </div>
                <img 
                  src={muralImg} 
                  alt="Muralismo Ramona Parra" 
                  className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
          
          <div className="absolute top-1/2 right-[-5%] opacity-5 pointer-events-none select-none hidden xl:block">
            <span className="text-[30rem] font-bold leading-none">CAMBIO</span>
          </div>
        </div>

        <section id="content-form-section" className="max-w-7xl mx-auto w-full px-6 md:px-12 py-16 scroll-mt-[75px] md:scroll-mt-[90px]">
          {showAdminDashboard && (
            <div className="mb-12">
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-[0.2em] block mb-2">Administración</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">Panel de Control</h2>
            </div>
          )}

          {/* List of items depending on tab */}
          <AnimatePresence mode="wait">
            {showAdminDashboard ? (
              <AdminDashboard key="admin" user={user} projects={projects} works={works} materials={materials} activities={activities} testimonials={testimonials} onOpenDetail={handleOpenDetail} />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-16"
              >
                {activeTab === 'projects' && (
                  <div className="space-y-12">
                    <FilterBar selected={selectedAsignatura} onSelect={setSelectedAsignatura} />
                    {visibleProjects.filter(p => !selectedAsignatura || p.category === selectedAsignatura).length === 0 ? (
                      <EmptyState text="No hay proyectos aprobados en esta asignatura todavía." />
                    ) : (
                      <RetroCarousel itemCount={visibleProjects.filter(p => !selectedAsignatura || p.category === selectedAsignatura).length}>
                        {visibleProjects
                          .filter(p => !selectedAsignatura || p.category === selectedAsignatura)
                          .map((project, i) => (
                            <div key={project.id} className="w-[85vw] sm:w-[360px] md:w-[380px] lg:w-[400px] shrink-0 snap-start">
                              <ProjectCard project={project} user={user} onOpenDetail={handleOpenDetail} accent={i % 3 === 0} />
                            </div>
                          ))
                        }
                      </RetroCarousel>
                    )}
                  </div>
                )}

                {activeTab === 'works' && (
                  <div className="space-y-12">
                    <CourseFilterBar selected={selectedCourse} onSelect={setSelectedCourse} />
                    {visibleWorks.filter(w => !selectedCourse || w.year === selectedCourse).length === 0 ? (
                      <EmptyState text="No hay trabajos aprobados en este curso." />
                    ) : (
                      <RetroCarousel itemCount={visibleWorks.filter(w => !selectedCourse || w.year === selectedCourse).length}>
                        {visibleWorks
                          .filter(w => !selectedCourse || w.year === selectedCourse)
                          .map((work, i) => (
                            <div key={work.id} className="w-[85vw] sm:w-[360px] md:w-[380px] lg:w-[400px] shrink-0 snap-start">
                              <WorkCard work={work} user={user} onOpenDetail={handleOpenDetail} dark={false} />
                            </div>
                          ))
                        }
                      </RetroCarousel>
                    )}
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="space-y-12">
                    <FilterBar selected={selectedAsignatura} onSelect={setSelectedAsignatura} />
                    {visibleMaterials.filter(m => !selectedAsignatura || m.subject === selectedAsignatura).length === 0 ? (
                      <EmptyState text="No hay recursos aprobados en esta asignatura." />
                    ) : (
                      <RetroCarousel itemCount={visibleMaterials.filter(m => !selectedAsignatura || m.subject === selectedAsignatura).length}>
                        {visibleMaterials
                          .filter(m => !selectedAsignatura || m.subject === selectedAsignatura)
                          .map(material => (
                            <div key={material.id} className="w-[75vw] sm:w-[280px] md:w-[300px] lg:w-[320px] shrink-0 snap-start">
                              <MaterialCard material={material} user={user} onOpenDetail={handleOpenDetail} />
                            </div>
                          ))
                        }
                      </RetroCarousel>
                    )}
                  </div>
                )}

                {activeTab === 'activities' && (
                  <div className="space-y-12">
                    <FilterBar selected={selectedAsignatura} onSelect={setSelectedAsignatura} />
                    {visibleActivities.filter(a => !selectedAsignatura || a.category === selectedAsignatura || (selectedAsignatura === 'Otros' && !a.category)).length === 0 ? (
                      <EmptyState text="No hay actividades comunitarias cargadas para esta asignatura." />
                    ) : (
                      <RetroCarousel itemCount={visibleActivities.filter(a => !selectedAsignatura || a.category === selectedAsignatura || (selectedAsignatura === 'Otros' && !a.category)).length}>
                        {visibleActivities
                          .filter(a => !selectedAsignatura || a.category === selectedAsignatura || (selectedAsignatura === 'Otros' && !a.category))
                          .map(activity => (
                            <div key={activity.id} className="w-[85vw] sm:w-[360px] md:w-[380px] lg:w-[400px] shrink-0 snap-start">
                              <ActivityCard activity={activity} user={user} onOpenDetail={handleOpenDetail} />
                            </div>
                          ))
                        }
                      </RetroCarousel>
                    )}
                  </div>
                )}

                {activeTab === 'testimonials' && (
                  <TestimonialsView testimonials={visibleTestimonials} user={user} />
                )}

                {activeTab === 'about' && (
                  <div className="space-y-24">
                    <ResumenPublicaciones 
                      visibleWorks={visibleWorks}
                      visibleProjects={visibleProjects}
                      visibleMaterials={visibleMaterials}
                      visibleActivities={visibleActivities}
                      onOpenDetail={handleOpenDetail}
                    />
                    <AboutSection />
                  </div>
                )}

                {/* Inline upload section BELOW the lists of publications (always active for all tabs) */}
                {true && (
                  <div id="new-content-form-anchor" className="mt-12 md:mt-20 border-t-4 border-brand-black pt-8 md:pt-16">
                    <AnimatePresence mode="wait">
                      {showForm ? (
                        <motion.div
                          key="form-edit"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <ContentForm 
                            onSuccess={handleFormSuccess} 
                            onCancel={() => setShowForm(false)}
                            user={user}
                            isAdmin={isAdmin}
                            forcedType={activeTab !== 'about' ? activeTab : undefined}
                          />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="form-cta"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-6 md:p-12 border-4 border-brand-black bg-white text-center shadow-[6px_6px_0px_0px_rgba(191,49,49,1)] md:shadow-[8px_8px_0px_0px_rgba(191,49,49,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
                        >
                          <span className="text-[10px] font-mono tracking-[0.3em] md:tracking-[0.4em] text-brand-red uppercase block mb-3 font-bold">Participación Colectiva EPJA</span>
                          <h4 className="text-xl sm:text-2xl md:text-3xl font-black uppercase mb-4 md:mb-6">¿Quieres registrar tu propio material o creación aquí?</h4>
                          <p className="text-xs md:text-sm text-gray-500 max-w-xl mx-auto mb-6 md:mb-8 font-serif italic">
                            {activeTab === 'about' && "Sube tus trabajos, creaciones literarias, proyectos didácticos o registros colectivos directamente para nutrir la memoria y el aprendizaje de toda la comunidad."}
                            {activeTab === 'works' && "Sube tus cuentos, reflexiones, obras literarias, ensayos o creaciones artísticas directamente para compartirlas con toda la comunidad."}
                            {activeTab === 'projects' && "Sube tus iniciativas de clase, proyectos colaborativos o indagaciones de aula para que queden registradas en el archivo histórico."}
                            {activeTab === 'materials' && "Sube tus guías pedagógicas, folletos explicativos o recursos para que otros maestros puedan usarlos en sus aulas."}
                            {activeTab === 'activities' && "Sube tus bitácoras de actividades colectivas, registros de talleres o crónicas fotográficas para celebrar los logros de la escuela."}
                          </p>
                          <PolishedButton 
                            onClick={() => {
                              setShowForm(true);
                              setTimeout(() => {
                                const el = document.getElementById('new-content-form-anchor');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }, 150);
                            }} 
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-brand-red text-white hover:bg-brand-black text-xs px-6 py-4 md:px-10 md:py-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-widest font-bold"
                          >
                            <Plus className="w-5 h-5 mr-3 shrink-0" />
                            Sube tu Contenido en esta Sección
                          </PolishedButton>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>


      {/* Footer */}
      <footer className="px-6 md:px-10 py-6 bg-brand-black text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[10px] uppercase tracking-widest opacity-50 text-center md:text-left select-none">
          © 2026 LICEO EUGENIO PEREIRA SALAS | JORNADA VESPERTINA
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-[10px] uppercase tracking-widest font-bold">
          <a href="#" className="hover:text-brand-red">Privacidad</a>
          <a href="#" className="hover:text-brand-red mr-1">Créditos</a>
          
          {/* Acceso Admin en el pie de página */}
          {!isAdmin && (
            <button 
              onClick={handleLogin} 
              className="hover:text-brand-red cursor-pointer transition-colors"
            >
              Acceso Admin
            </button>
          )}

          {/* Admin panel controls only visible once logged in in footer */}
          {isAdmin && (
            <div className="flex items-center gap-4 border-l border-gray-800 pl-4">
              <button 
                onClick={() => { setShowAdminDashboard(true); setShowForm(false); }}
                className={cn(
                  "cursor-pointer text-[10px] uppercase tracking-widest transition-colors font-black select-none",
                  showAdminDashboard ? "text-brand-red" : "text-gray-300 hover:text-brand-red"
                )}
              >
                Panel Admin {unapprovedCount > 0 && <span className="ml-1 bg-brand-red text-white px-1.5 py-0.5 text-[8px] font-bold rounded-none">{unapprovedCount}</span>}
              </button>
              <span className="text-gray-700 select-none">|</span>
              <button 
                onClick={handleLogout} 
                className="hover:text-brand-red cursor-pointer text-[10px] uppercase tracking-widest font-bold text-gray-400 select-none"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </footer>
      <AnimatePresence>
        {selectedDetailItem && (
          <DetailModal 
            item={selectedDetailItem} 
            onClose={() => setSelectedDetailItem(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active = false, onClick, isMobile = false, children }: { active?: boolean, onClick: () => void, isMobile?: boolean, children: ReactNode }) {
  if (isMobile) {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest border-2 border-brand-black transition-all duration-150 cursor-pointer select-none",
          active 
            ? "bg-brand-red text-white shadow-none translate-x-0.5 translate-y-0.5" 
            : "bg-white text-brand-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 xl:px-5 py-3 text-[11px] xl:text-xs font-extrabold uppercase tracking-widest transition-all duration-150 select-none cursor-pointer border-none whitespace-nowrap",
        active 
          ? "bg-brand-red text-white" 
          : "text-brand-black hover:bg-brand-red/10 bg-transparent"
      )}
    >
      {children}
    </button>
  );
}

function SidebarItem({ title, date, icon, children }: { title: string, date: string, icon: ReactNode, children: ReactNode }) {
  return (
    <div className="p-6 border-2 border-brand-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
      <div className="text-[10px] font-bold uppercase text-brand-red mb-2 flex items-center gap-2">
        {icon} <span className="tracking-[0.2em]">{title}</span>
      </div>
      <div className="text-lg font-bold leading-tight mb-2 uppercase tracking-tighter">{children}</div>
      <div className="text-[10px] text-gray-400 font-mono italic">{date}</div>
    </div>
  );
}

function StatusBadge({ approved, rejected, isAdmin, isAuthor }: { approved: boolean, rejected: boolean, isAdmin: boolean, isAuthor: boolean }) {
  if (rejected) {
    return (
      <div className="bg-brand-red text-white px-2 py-1 text-[8px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 border border-black">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
        Rechazado
      </div>
    );
  }
  
  if (!approved) {
    return (
      <div className="bg-yellow-400 text-black px-2 py-1 text-[8px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 border border-black animate-pulse">
        <div className="w-1.5 h-1.5 bg-black rounded-full" />
        Pendiente
      </div>
    );
  }

  if (isAdmin || isAuthor) {
    return (
      <div className="bg-green-600 text-white px-2 py-1 text-[8px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 border border-black">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
        Aprobado
      </div>
    );
  }

  return null;
}

function CardMediaPreview({
  attachmentUrl,
  attachmentType,
  attachmentName,
  imageUrl,
  driveLink
}: {
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  imageUrl?: string;
  driveLink?: string;
}) {
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [showDrivePreview, setShowDrivePreview] = useState(false);
  const url = attachmentUrl || imageUrl;
  
  // Convert Drive Link to preview format
  function getGoogleDriveEmbedUrl(linkUrl: string) {
    if (!linkUrl) return '';
    try {
      if (linkUrl.includes('/preview') || linkUrl.includes('embeddedfolderview')) {
        return linkUrl;
      }
      
      const urlObj = new URL(linkUrl);
      if (urlObj.hostname.includes('google.com')) {
        // 1. Standard /d/ID format
        const dMatch = linkUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (dMatch && dMatch[1]) {
          const fileId = dMatch[1];
          if (linkUrl.includes('/document/')) {
            return `https://docs.google.com/document/d/${fileId}/preview`;
          }
          if (linkUrl.includes('/presentation/')) {
            return `https://docs.google.com/presentation/d/${fileId}/preview`;
          }
          if (linkUrl.includes('/spreadsheets/')) {
            return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
          }
          return `https://drive.google.com/file/d/${fileId}/preview`;
        }

        // 2. Query param format: id=ID
        const idParam = urlObj.searchParams.get('id');
        if (idParam) {
          if (linkUrl.includes('/document')) {
            return `https://docs.google.com/document/d/${idParam}/preview`;
          }
          if (linkUrl.includes('/presentation')) {
            return `https://docs.google.com/presentation/d/${idParam}/preview`;
          }
          if (linkUrl.includes('/spreadsheets')) {
            return `https://docs.google.com/spreadsheets/d/${idParam}/preview`;
          }
          return `https://drive.google.com/file/d/${idParam}/preview`;
        }

        // 3. Folder format: /folders/FOLDER_ID
        const folderMatch = linkUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (folderMatch && folderMatch[1]) {
          return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
        }
      }
    } catch (e) {
      console.error('Error parsing Drive URL', e);
    }
    return '';
  }

  const driveEmbedUrl = driveLink ? getGoogleDriveEmbedUrl(driveLink) : '';

  if (!url && !driveEmbedUrl) return null;

  const isImage = (attachmentType && attachmentType.startsWith('image/')) || 
                  (url && url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) ||
                  imageUrl;
                  
  const isVideo = (attachmentType && attachmentType.startsWith('video/')) || 
                  (url && url.match(/\.(mp4|webm|ogg|mov)/i));

  const isPdf = (attachmentType && attachmentType === 'application/pdf') || 
                (url && url.match(/\.pdf/i));

  const isWord = (attachmentType && (attachmentType.includes('word') || attachmentType.includes('officedocument.wordprocessingml'))) || 
                 (url && url.match(/\.(doc|docx)/i));

  const isExcel = (attachmentType && (attachmentType.includes('excel') || attachmentType.includes('officedocument.spreadsheetml'))) || 
                  (url && url.match(/\.(xls|xlsx)/i));

  const isPpt = (attachmentType && (attachmentType.includes('powerpoint') || attachmentType.includes('officedocument.presentationml'))) || 
                (url && url.match(/\.(ppt|pptx)/i));

  const isOffice = isWord || isExcel || isPpt;

  const getDocViewerUrl = () => {
    if (!url) return '';
    if (isOffice) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Image */}
      {url && isImage && (
        <div className="w-full aspect-[9/16] overflow-hidden bg-brand-bg border-b-4 border-brand-black relative mb-4">
          <img 
            src={url} 
            alt={attachmentName || "Publicación"} 
            className="object-cover w-full h-full filter hover:filter-none transition-all duration-500 hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Main Video */}
      {url && isVideo && (
        <div className="w-full aspect-[9/16] overflow-hidden bg-brand-black border-b-4 border-brand-black relative mb-4 flex items-center justify-center animate-fade-in">
          <video 
            src={url} 
            controls 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main PDF/Office Doc Attachment */}
      {url && !isImage && !isVideo && (
        <div className="w-full mb-4 flex flex-col border-2 border-brand-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
          <div className="w-full p-4 bg-brand-bg flex items-center justify-between gap-3 border-b-2 border-brand-black">
            <div className="flex items-center gap-3 min-w-0">
              <FileIcon className="w-8 h-8 text-brand-red shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase truncate text-brand-black">{attachmentName || "Documento Adjunto"}</p>
                <span className="text-[8px] font-mono uppercase text-gray-400">Documento de Lectura</span>
              </div>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-brand-black text-white hover:bg-brand-red text-[10px] font-mono uppercase font-black tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
            >
              Descargar
            </a>
          </div>
          <div className="w-full h-[450px] bg-neutral-100 relative">
            <iframe 
              src={getDocViewerUrl()} 
              className="w-full h-full border-none" 
              title="Vista previa del documento"
              sandbox="allow-same-origin allow-scripts allow-popups"
            />
          </div>
        </div>
      )}

      {/* Google Drive Link Preview */}
      {driveEmbedUrl && (
        <div className="w-full mb-4 flex flex-col border-2 border-brand-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
          <div className="w-full p-4 bg-brand-bg flex items-center justify-between gap-3 border-b-2 border-brand-black">
            <div className="flex items-center gap-3 min-w-0">
              <Globe className="w-8 h-8 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase truncate text-brand-black">Documento Google Drive</p>
                <span className="text-[8px] font-mono uppercase text-gray-400">Enlace Externo Vinculado</span>
              </div>
            </div>
            <a
              href={driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-brand-black text-white hover:bg-brand-red text-[10px] font-mono uppercase font-black tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
            >
              Abrir Link
            </a>
          </div>
          <div className="w-full h-[450px] bg-neutral-100 relative">
            <iframe 
              src={driveEmbedUrl} 
              className="w-full h-full border-none" 
              title="Vista previa del documento de Google Drive"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailModal({ 
  item, 
  onClose 
}: { 
  item: any; 
  onClose: () => void; 
}) {
  return (
    <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white text-brand-black max-w-2xl w-full border-4 border-brand-black p-6 sm:p-8 z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-brand-red p-2 transition-colors cursor-pointer z-20 border-2 border-brand-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
            <span className="text-[10px] font-mono tracking-widest font-extrabold text-brand-red uppercase">
              {item.categoryLabel}
            </span>
            {item.categoryValue && (
              <span className="inline-block px-2 py-0.5 text-[8px] font-extrabold uppercase bg-brand-black text-white font-mono tracking-widest ml-2 leading-none">
                {item.categoryValue}
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none text-brand-black border-b-4 border-brand-black pb-4 pr-10">
            {item.title}
          </h3>

          {/* Visual preview of media */}
          <CardMediaPreview 
            attachmentUrl={item.attachmentUrl} 
            attachmentType={item.attachmentType} 
            attachmentName={item.attachmentName}
            imageUrl={item.imageUrl}
            driveLink={item.driveLink}
          />

          <div className="p-5 bg-brand-bg border-l-4 border-brand-red font-sans text-gray-900 text-sm leading-relaxed whitespace-pre-line font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
            {item.description}
          </div>

          {/* Author/Creator details */}
          <div className="flex flex-col gap-2 p-3 bg-gray-50 border border-brand-border">
            {item.studentName && (
              <div className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className="text-gray-400 uppercase font-mono">Autor/a o Estudiante:</span>
                <span className="font-bold text-brand-black">{item.studentName} {item.year ? `(${item.year})` : ''}</span>
              </div>
            )}
            {item.teacherName && (
              <div className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className="text-gray-400 uppercase font-mono">Profesor/a cargo:</span>
                <span className="font-bold text-brand-black">{item.teacherName}</span>
              </div>
            )}
            {item.authorName && !item.studentName && !item.teacherName && (
              <div className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className="text-gray-400 uppercase font-mono">Compartido por:</span>
                <span className="font-bold text-brand-black">{item.authorName}</span>
              </div>
            )}
          </div>

          {/* Links and Attachments */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-brand-border">
            {item.driveLink && (
              <a 
                href={item.driveLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase border-b-2 text-blue-600 border-blue-600 hover:text-brand-black hover:border-brand-black"
              >
                <Link2 className="w-4 h-4" /> Abrir en Google Drive
              </a>
            )}
            {item.link && (
              <a 
                href={item.link.startsWith('http') ? item.link : `https://${item.link}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase border-b-2 text-blue-600 border-blue-600 hover:text-brand-black hover:border-brand-black"
              >
                <Link2 className="w-4 h-4" /> Fuente Digital
              </a>
            )}
            {item.attachmentUrl && (
              <a 
                href={item.attachmentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase border-b-2 text-green-700 border-green-700 hover:text-brand-black hover:border-brand-black"
              >
                <Paperclip className="w-4 h-4" /> Descargar Archivo Adjunto
              </a>
            )}
          </div>

          <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-center text-[9px] font-mono text-gray-400 uppercase">
            <span>Referencia ID: {item.id.substring(0, 8)}</span>
            <span>Liceo EPS</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface ProjectCardProps {
  project: any;
  user: any;
  onOpenDetail: (item: any, type: 'projects' | 'works' | 'materials' | 'activities') => void;
  accent?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  key?: any;
}

function ProjectCard({ project, user, onOpenDetail, accent = false, isSelected, onSelect }: ProjectCardProps) {
  const confirm = useRetroConfirm();
  const adminEmails = ['crwom01@gmail.com', 'leps.vespertina.epja@gmail.com', 'jav.arayamolina@gmail.com'];
  const isAdmin = (user?.email && adminEmails.includes(user.email)) || (typeof window !== 'undefined' && (window as any).__isDemoAdmin);
  const isAuthor = user?.uid === project.authorId;
  
  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar Proyecto",
      message: `¿Estás completamente seguro de que deseas eliminar permanentemente el proyecto "${project.title || 'este proyecto'}"?`,
      confirmText: "Eliminar definitivo",
      cancelText: "Volver atrás",
      isDestructive: true
    });
    if (ok) {
      await FirestoreService.remove('projects', project.id);
    }
  };

  const handlePin = async () => {
    await FirestoreService.update('projects', project.id, { pinned: !project.pinned });
  };

  const handleApprove = async () => {
    await FirestoreService.update('projects', project.id, { approved: true, rejected: false });
  };

  const handleUnapprove = async () => {
    await FirestoreService.update('projects', project.id, { approved: false, rejected: false });
  };

  const handleReject = async () => {
    const ok = await confirm({
      title: "Rechazar Proyecto",
      message: `¿Deseas rechazar el proyecto "${project.title || 'este proyecto'}"? Podrás verlo en la pestaña de Rechazados del panel administrador.`,
      confirmText: "Rechazar proyecto",
      cancelText: "Mantener pendiente",
      isDestructive: true
    });
    if (ok) {
      await FirestoreService.update('projects', project.id, { approved: false, rejected: true });
    }
  };

  return (
    <PolishedCard 
      accent={accent} 
      className={cn(
        "h-full border-4 border-brand-black group hover:translate-y-[-8px] hover:translate-x-[-2px] relative transition-all duration-300",
        accent 
          ? "bg-brand-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[14px_14px_0px_0px_rgba(191,49,49,1)]" 
          : "bg-white text-brand-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[14px_14px_0px_0px_rgba(191,49,49,1)]",
        isSelected && "ring-4 ring-brand-red ring-offset-2"
      )}
    >
      {onSelect && (
        <div className="absolute top-4 left-4 z-20">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => onSelect(project.id)}
            className="w-5 h-5 cursor-pointer accent-brand-red"
          />
        </div>
      )}
      <div className="absolute top-0 right-0 p-3 z-10">
        <StatusBadge 
          approved={project.approved} 
          rejected={project.rejected} 
          isAdmin={isAdmin} 
          isAuthor={isAuthor} 
        />
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-5">
          <span className={cn("w-2.5 h-2.5 bg-brand-red shrink-0", accent ? "animate-pulse" : "")} />
          <span className={cn("text-[9px] font-mono tracking-widest font-extrabold uppercase", accent ? "text-brand-red" : "text-brand-red")}>
            PROYECTO
          </span>
          {project.pinned && (
            <span className="ml-auto px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-brand-red text-white border border-brand-red animate-pulse">📌 FIJADO</span>
          )}
        </div>

        <div className={cn("inline-block px-3 py-1.5 text-[10px] font-black uppercase tracking-widest mb-6 border-2 border-brand-black", accent ? "bg-white text-brand-black" : "bg-brand-black text-white")}>
          {project.category}
        </div>
        <h4 className="text-3xl lg:text-4xl font-extrabold leading-[0.95] tracking-tighter uppercase mb-6 break-words group-hover:text-brand-red transition-colors font-sans">
          {project.title}
        </h4>
        <CardMediaPreview attachmentUrl={project.attachmentUrl} attachmentType={project.attachmentType} attachmentName={project.attachmentName} imageUrl={project.imageUrl} driveLink={project.driveLink} />
        <div className={cn("p-4 border-l-4 border-brand-red mb-6", accent ? "bg-white/5" : "bg-brand-bg")}>
          <p className={cn("text-xs md:text-sm leading-relaxed line-clamp-5 font-medium not-italic font-sans", accent ? "text-white" : "text-gray-900")}>
            {project.description}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-auto">
        {isAdmin && (
          <div className="flex flex-col gap-2 pt-4 border-t border-current border-opacity-10 mb-4">
            {project.rejected ? (
              <PolishedButton onClick={handleApprove} className="w-full bg-green-600 text-white hover:bg-green-700 text-[10px] py-2 border-none">
                Aprobar Proyecto
              </PolishedButton>
            ) : !project.approved ? (
              <div className="flex gap-2">
                <PolishedButton onClick={handleApprove} className="flex-1 bg-green-600 text-white hover:bg-green-700 text-[10px] py-2 border-none">
                  Aprobar
                </PolishedButton>
                <PolishedButton onClick={handleReject} className="flex-1 bg-brand-red text-white hover:bg-red-700 text-[10px] py-2 border-none">
                  Rechazar
                </PolishedButton>
              </div>
            ) : (
              <PolishedButton onClick={handleUnapprove} className="w-full bg-yellow-500 text-black hover:bg-yellow-600 text-[10px] py-2 border-none">
                Desaprobar Proyecto
              </PolishedButton>
            )}
            <PolishedButton 
              onClick={handlePin}
              className={cn(
                "w-full text-[10px] py-2 border-2 border-brand-black font-bold uppercase",
                project.pinned 
                  ? "bg-brand-black text-white hover:bg-brand-red" 
                  : "bg-white text-brand-black hover:bg-brand-black hover:text-white"
              )}
            >
              {project.pinned ? '📌 Desfijar Proyecto' : '📌 Fijar Proyecto'}
            </PolishedButton>
          </div>
        )}
        <div className="flex justify-between items-center text-[8px] font-mono opacity-50 uppercase tracking-widest">
          <div>
            Por: {project.authorName || 'Anónimo'}
          </div>
          <div className="flex items-center gap-4">
            {user && (project.authorId === user.uid || isAdmin) && (
              <button onClick={handleDelete} className={cn("hover:scale-110 transition-transform cursor-pointer", accent ? "text-white/40 hover:text-white" : "text-gray-300 hover:text-brand-red")}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <PolishedButton 
              variant="ghost" 
              onClick={() => onOpenDetail(project, 'projects')}
              className={cn("px-0 group cursor-pointer", accent ? "text-white hover:text-white" : "text-brand-black hover:text-brand-red")}
            >
              <span className="underline decoration-2 underline-offset-4 text-[10px] font-bold uppercase tracking-widest">Explorar Proyecto</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </PolishedButton>
          </div>
        </div>
      </div>
    </PolishedCard>
  );
}

interface WorkCardProps {
  work: any;
  user: any;
  onOpenDetail: (item: any, type: 'projects' | 'works' | 'materials' | 'activities') => void;
  dark?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  key?: any;
}

function WorkCard({ work, user, onOpenDetail, dark = false, isSelected, onSelect }: WorkCardProps) {
  const confirm = useRetroConfirm();
  const adminEmails = ['crwom01@gmail.com', 'leps.vespertina.epja@gmail.com', 'jav.arayamolina@gmail.com'];
  const isAdmin = (user?.email && adminEmails.includes(user.email)) || (typeof window !== 'undefined' && (window as any).__isDemoAdmin);
  const isAuthor = user?.uid === work.authorId;
  
  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar Creación",
      message: `¿Estás completamente seguro de que deseas eliminar permanentemente el escrito/creación "${work.title || 'esta creación'}"?`,
      confirmText: "Eliminar definitivo",
      cancelText: "Volver atrás",
      isDestructive: true
    });
    if (ok) {
      await FirestoreService.remove('studentWorks', work.id);
    }
  };

  const handleApprove = async () => {
    await FirestoreService.update('studentWorks', work.id, { approved: true, rejected: false });
  };

  const handleUnapprove = async () => {
    await FirestoreService.update('studentWorks', work.id, { approved: false, rejected: false });
  };

  const handleReject = async () => {
    const ok = await confirm({
      title: "Rechazar Creación",
      message: `¿Deseas rechazar el escrito "${work.title || 'este escrito'}"? Podrás verlo en la pestaña de Rechazados del panel administrador.`,
      confirmText: "Rechazar escrito",
      cancelText: "Mantener pendiente",
      isDestructive: true
    });
    if (ok) {
      await FirestoreService.update('studentWorks', work.id, { approved: false, rejected: true });
    }
  };

  const handlePin = async () => {
    await FirestoreService.update('studentWorks', work.id, { pinned: !work.pinned });
  };

  return (
    <PolishedCard 
      dark={dark} 
      className={cn(
        "h-full border-4 border-brand-black group hover:translate-y-[-8px] hover:translate-x-[-2px] relative transition-all duration-300",
        dark 
          ? "bg-brand-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[14px_14px_0px_0px_rgba(191,49,49,1)]" 
          : "bg-white text-brand-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[14px_14px_0px_0px_rgba(191,49,49,1)]",
        isSelected && "ring-4 ring-brand-red ring-offset-2"
      )}
    >
      {onSelect && (
        <div className="absolute top-4 left-4 z-20">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => onSelect(work.id)}
            className="w-5 h-5 cursor-pointer accent-brand-red"
          />
        </div>
      )}
      <div className="absolute top-0 right-0 p-3 z-10">
        <StatusBadge 
          approved={work.approved} 
          rejected={work.rejected} 
          isAdmin={isAdmin} 
          isAuthor={isAuthor} 
        />
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-brand-black", dark ? "bg-white text-brand-black" : "bg-brand-black text-white")}>
            {work.workType}
          </div>
          <div className="flex items-center gap-2">
            {work.pinned && (
              <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-brand-red text-white animate-pulse">📌 FIJADO</span>
            )}
            <span className={cn("text-[10px] font-mono font-extrabold tracking-widest uppercase", dark ? "text-brand-red" : "text-brand-red")}>{work.year}</span>
          </div>
        </div>
        
        <h4 className="text-3xl lg:text-4xl font-extrabold leading-[1] tracking-tight mb-4 uppercase text-brand-red font-sans">
          {work.title}
        </h4>

        <CardMediaPreview attachmentUrl={work.attachmentUrl} attachmentType={work.attachmentType} attachmentName={work.attachmentName} imageUrl={work.imageUrl} driveLink={work.driveLink} />
        
        <div className={cn("relative p-6 mb-6 border-l-4 border-brand-red", dark ? "bg-white/5" : "bg-brand-bg")}>
          <span className="text-5xl font-serif text-brand-red leading-none absolute top-1 left-2 select-none opacity-30">“</span>
          <p className={cn("text-sm md:text-base leading-relaxed font-sans not-italic line-clamp-8 pt-4", dark ? "text-white" : "text-brand-black font-semibold")}>
            {work.content}
          </p>
          <div className={cn("absolute bottom-2 right-2 opacity-10", dark ? "text-white" : "text-brand-red")}>
            <FileText className="w-10 h-10" />
          </div>
        </div>
        
        {work.link && (
          <a 
            href={work.link.startsWith('http') ? work.link : `https://${work.link}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn("inline-flex items-center text-[10px] font-bold uppercase border-b-2 gap-2 mb-2", dark ? "text-brand-red border-brand-red hover:text-white hover:border-white" : "text-brand-red border-brand-red hover:text-black hover:border-black")}
          >
            Abrir Fuente Digital <ArrowRight className="w-3 h-3" />
          </a>
        )}
        {work.driveLink && (
          <a 
            href={work.driveLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn("inline-flex items-center gap-2 mb-2 text-[10px] font-bold uppercase border-b-2", dark ? "text-blue-400 border-blue-400 hover:text-white hover:border-white" : "text-blue-600 border-blue-600 hover:text-brand-black hover:border-brand-black")}
          >
            <Link2 className="w-3 h-3" /> Ver en Drive
          </a>
        )}
        {work.attachmentUrl && (
          <a 
            href={work.attachmentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn("inline-flex items-center gap-2 mb-4 text-[10px] font-bold uppercase border-b-2", dark ? "text-green-400 border-green-400 hover:text-white hover:border-white" : "text-green-700 border-green-700 hover:text-brand-black hover:border-brand-black")}
          >
            <Paperclip className="w-3 h-3" /> Descargar Adjunto
          </a>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        {isAdmin && (
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
            {work.rejected ? (
              <div className="flex gap-2">
                <PolishedButton className="bg-blue-600 text-white hover:bg-blue-700 flex-1 text-[10px]" onClick={handleUnapprove}>
                  Restaurar
                </PolishedButton>
                <PolishedButton className="bg-green-600 text-white hover:bg-green-700 flex-1 text-[10px]" onClick={handleApprove}>
                  Aprobar
                </PolishedButton>
              </div>
            ) : !work.approved ? (
              <div className="flex gap-2">
                <PolishedButton className="bg-green-600 text-white hover:bg-green-700 flex-1 text-[10px]" onClick={handleApprove}>
                  Aprobar
                </PolishedButton>
                <button onClick={handleReject} title="Rechazar" className="bg-brand-red text-white p-2 hover:bg-black transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={handleUnapprove} className="text-[9px] font-bold uppercase text-brand-red hover:underline text-left">
                Retirar (Mover a Pendientes)
              </button>
            )}
            <button
              onClick={handlePin}
              className={cn("text-[9px] font-bold uppercase hover:underline text-left flex items-center gap-1", work.pinned ? "text-brand-red" : "text-gray-400 hover:text-brand-red")}
            >
              {work.pinned ? '📌 Desfijar publicación' : '📌 Fijar publicación'}
            </button>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t border-brand-border">
          <div className="flex flex-col">
            <span className={cn("text-[9px] font-mono tracking-widest uppercase opacity-40", dark ? "text-white" : "text-gray-500")}>Escrito por</span>
            <span className={cn("text-xs font-black uppercase mt-1", dark ? "text-brand-red" : "text-brand-black")}>{work.studentName}</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (work.authorId === user.uid || isAdmin) && (
              <button onClick={handleDelete} className={cn("hover:text-brand-red hover:scale-110 transition-all cursor-pointer", dark ? "text-white/40" : "text-gray-300 hover:text-brand-red")}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <PolishedButton 
              variant="ghost" 
              onClick={() => onOpenDetail(work, 'works')}
              className={cn("px-0 group cursor-pointer", dark ? "text-white hover:text-white" : "text-brand-black hover:text-brand-red")}
            >
              <span className="underline decoration-2 underline-offset-4 text-[10px] font-bold uppercase tracking-widest">Leer Escrito</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </PolishedButton>
          </div>
        </div>
      </div>
    </PolishedCard>
  );
}

interface MaterialCardProps {
  material: any;
  user: any;
  onOpenDetail: (item: any, type: 'projects' | 'works' | 'materials' | 'activities') => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  key?: any;
}

function MaterialCard({ material, user, onOpenDetail, isSelected, onSelect }: MaterialCardProps) {
  const confirm = useRetroConfirm();
  const adminEmails = ['crwom01@gmail.com', 'leps.vespertina.epja@gmail.com', 'jav.arayamolina@gmail.com'];
  const isAdmin = (user?.email && adminEmails.includes(user.email)) || (typeof window !== 'undefined' && (window as any).__isDemoAdmin);
  const isAuthor = user?.uid === material.authorId;

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar Recurso",
      message: `¿Estás completamente seguro de que deseas eliminar permanentemente el recurso "${material.title || 'este recurso'}"?`,
      confirmText: "Eliminar definitivo",
      cancelText: "Volver atrás",
      isDestructive: true
    });
    if (ok) {
      await FirestoreService.remove('materials', material.id);
    }
  };

  const handleApprove = async () => {
    await FirestoreService.update('materials', material.id, { approved: true, rejected: false });
  };

  const handleUnapprove = async () => {
    await FirestoreService.update('materials', material.id, { approved: false, rejected: false });
  };

  const handleReject = async () => {
    const ok = await confirm({
      title: "Rechazar Recurso",
      message: `¿Deseas rechazar el recurso "${material.title || 'este recurso'}"? Podrás verlo en la pestaña de Rechazados del panel administrador.`,
      confirmText: "Rechazar recurso",
      cancelText: "Mantener pendiente",
      isDestructive: true
    });
    if (ok) {
      await FirestoreService.update('materials', material.id, { approved: false, rejected: true });
    }
  };

  const handlePin = async () => {
    await FirestoreService.update('materials', material.id, { pinned: !material.pinned });
  };

  return (
    <PolishedCard 
      className={cn(
        "h-full border-4 border-brand-black bg-white text-brand-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[14px_14px_0px_0px_rgba(191,49,49,1)] flex flex-col relative transition-all duration-300", 
        isSelected && "ring-4 ring-brand-red ring-offset-2"
      )}
    >
      {onSelect && (
        <div className="absolute top-4 left-4 z-20">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => onSelect(material.id)}
            className="w-5 h-5 cursor-pointer accent-brand-red"
          />
        </div>
      )}
      <div className="absolute top-0 right-0 p-3 z-10">
        <StatusBadge 
          approved={material.approved} 
          rejected={material.rejected} 
          isAdmin={isAdmin} 
          isAuthor={isAuthor} 
        />
      </div>
      <div className="p-6 bg-brand-black text-white border-b-4 border-brand-black -mx-6 -mt-6 mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono font-extrabold tracking-[0.2em] text-brand-red uppercase">RECURSO PROF.</div>
          {material.pinned && (
            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-brand-red text-white animate-pulse">📌 FIJADO</span>
          )}
        </div>
        <div className="inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest bg-brand-red text-white mb-4">
          {material.subject}
        </div>
        <h4 className="text-2xl lg:text-3xl font-extrabold leading-[1.05] uppercase tracking-tighter">{material.title}</h4>
      </div>

      <CardMediaPreview attachmentUrl={material.attachmentUrl} attachmentType={material.attachmentType} attachmentName={material.attachmentName} driveLink={material.driveLink} />
      
      <div className="flex-grow flex flex-col justify-between">
        <div>
          {material.description ? (
            <div className="p-4 bg-brand-bg border-l-4 border-brand-red mb-6 text-xs md:text-sm text-gray-900 font-semibold not-italic font-sans">
              {material.description}
            </div>
          ) : (
            <div className="text-gray-400 italic text-xs mb-6">Sin descripción pedagógica adicional.</div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 border border-brand-border">
          <div className="w-9 h-9 border-2 border-brand-black bg-brand-red text-white flex items-center justify-center font-bold text-sm uppercase font-mono">
            {material.teacherName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-gray-400">Publicado por</span>
            <span className="text-xs font-black uppercase text-brand-black">
              {material.teacherName.startsWith('Prof.') ? material.teacherName : `Prof. ${material.teacherName}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        {isAdmin && (
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
            {material.rejected ? (
               <div className="flex gap-2">
                <PolishedButton className="bg-blue-600 text-white hover:bg-blue-700 flex-1 text-[10px]" onClick={handleUnapprove}>
                  Restaurar
                </PolishedButton>
                <PolishedButton className="bg-green-600 text-white hover:bg-green-700 flex-1 text-[10px]" onClick={handleApprove}>
                  Aprobar
                </PolishedButton>
              </div>
            ) : !material.approved ? (
              <div className="flex gap-2">
                <PolishedButton className="bg-green-600 text-white hover:bg-green-700 flex-1 text-[10px]" onClick={handleApprove}>
                  Aprobar
                </PolishedButton>
                <button onClick={handleReject} title="Rechazar" className="bg-brand-red text-white p-2 hover:bg-black transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={handleUnapprove} className="text-[9px] font-bold uppercase text-brand-red hover:underline text-left">
                Retirar (Mover a Pendientes)
              </button>
            )}
            <button
              onClick={handlePin}
              className={cn("text-[9px] font-bold uppercase hover:underline text-left flex items-center gap-1", material.pinned ? "text-brand-red" : "text-gray-400 hover:text-brand-red")}
            >
              {material.pinned ? '📌 Desfijar publicación' : '📌 Fijar publicación'}
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2 pt-4 border-t border-brand-border">
          <div className="flex items-center gap-3">
            <PolishedButton 
              variant="primary" 
              onClick={() => onOpenDetail(material, 'materials')}
              className="flex-grow text-[10px] py-4 uppercase font-bold tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-brand-black bg-brand-red text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 mr-2 inline animate-pulse" />
              Ver Recurso Pedagógico
            </PolishedButton>
            {user && (material.authorId === user.uid || isAdmin) && (
              <button onClick={handleDelete} className="p-3 text-gray-300 hover:text-brand-red hover:scale-110 transition-all cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {material.attachmentUrl && (
            <a href={material.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-green-700 border-b-2 border-green-700 hover:text-brand-black hover:border-brand-black self-start mt-2">
              <Paperclip className="w-3 h-3" /> Descargar Adjunto Subido
            </a>
          )}
        </div>
      </div>
    </PolishedCard>
  );
}

interface ActivityCardProps {
  activity: Activity;
  user: User | null;
  onOpenDetail: (item: any, type: 'projects' | 'works' | 'materials' | 'activities') => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  key?: any;
}

function ActivityCard({ activity, user, onOpenDetail, isSelected, onSelect }: ActivityCardProps) {
  const confirm = useRetroConfirm();
  const adminEmails = ['crwom01@gmail.com', 'leps.vespertina.epja@gmail.com', 'jav.arayamolina@gmail.com'];
  const isAdmin = (user?.email && adminEmails.includes(user.email)) || (typeof window !== 'undefined' && (window as any).__isDemoAdmin);
  const isAuthor = user?.uid === activity.authorId;

  const handleApprove = async () => {
    try {
      await FirestoreService.update('activities', activity.id, { approved: true, rejected: false });
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async () => {
    const ok = await confirm({
      title: "Rechazar Actividad",
      message: `¿Deseas rechazar la actividad comunitaria "${activity.title || 'esta actividad'}"? Podrás verla en la pestaña de Rechazados del panel administrador.`,
      confirmText: "Rechazar actividad",
      cancelText: "Mantener pendiente",
      isDestructive: true
    });
    if (ok) {
      try {
        await FirestoreService.update('activities', activity.id, { approved: false, rejected: true });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUnapprove = async () => {
    try {
      await FirestoreService.update('activities', activity.id, { approved: false, rejected: false });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar Actividad",
      message: `¿Estás completamente seguro de que deseas eliminar permanentemente la actividad comunitaria "${activity.title || 'esta actividad'}"?`,
      confirmText: "Eliminar definitiva",
      cancelText: "Volver atrás",
      isDestructive: true
    });
    if (ok) {
      try {
        await FirestoreService.remove('activities', activity.id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handlePin = async () => {
    try {
      await FirestoreService.update('activities', activity.id, { pinned: !activity.pinned });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PolishedCard 
      title=""
      className={cn(
        "flex flex-col h-full border-4 border-brand-black bg-white text-brand-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[14px_14px_0px_0px_rgba(191,49,49,1)] transition-all duration-300 relative pb-6",
        isSelected && "ring-4 ring-brand-red ring-offset-2"
      )}
    >
      {onSelect && (
        <div className="absolute top-4 left-4 z-20">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => onSelect(activity.id)}
            className="w-5 h-5 cursor-pointer accent-brand-red"
          />
        </div>
      )}
      <div className="absolute top-0 right-0 p-3 z-10 bg-white border-l-2 border-b-2 border-brand-black">
        <StatusBadge 
          approved={activity.approved} 
          rejected={activity.rejected} 
          isAdmin={isAdmin} 
          isAuthor={isAuthor} 
        />
      </div>

      <div className="flex flex-col flex-grow gap-4 pt-6">
        <CardMediaPreview 
          attachmentUrl={activity.attachmentUrl} 
          attachmentType={activity.attachmentType} 
          attachmentName={activity.attachmentName}
          imageUrl={activity.imageUrl}
          driveLink={activity.driveLink}
        />
        {!activity.imageUrl && !activity.attachmentUrl && (
          <div className="aspect-video w-full bg-brand-red/10 border-b-4 border-brand-black flex items-center justify-center relative p-6">
            <span className="text-xl font-black font-mono tracking-widest text-brand-red/30">LIPES COMUNIDAD</span>
          </div>
        )}

        <div className="flex-grow space-y-4 px-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.2em] font-extrabold text-brand-red uppercase">ACTIVIDAD COLECTIVA</span>
              {activity.pinned && (
                <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-brand-red text-white animate-pulse">📌 FIJADO</span>
              )}
            </div>
            <h4 className="text-2xl lg:text-3xl font-extrabold uppercase tracking-tighter leading-none">{activity.title}</h4>
          </div>

          <div className="p-4 bg-brand-bg border-l-4 border-brand-red text-xs md:text-sm text-gray-900 font-semibold not-italic font-sans leading-relaxed whitespace-pre-line">
            {activity.description}
          </div>

          {(activity.driveLink || activity.attachmentUrl) && (
            <div className="flex flex-wrap gap-3 px-0">
              {activity.driveLink && (
                <a
                  href={activity.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-blue-600 border-b-2 border-blue-600 hover:text-brand-black hover:border-brand-black"
                >
                  <Link2 className="w-3 h-3" /> Ver en Drive
                </a>
              )}
              {activity.attachmentUrl && (
                <a
                  href={activity.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-green-700 border-b-2 border-green-700 hover:text-brand-black hover:border-brand-black"
                >
                  <Paperclip className="w-3 h-3" /> Descargar Adjunto
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-auto px-2">
          {isAdmin && (
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              {activity.rejected ? (
                 <div className="flex gap-2">
                  <PolishedButton className="bg-blue-600 text-white hover:bg-blue-700 flex-1 text-[10px]" onClick={handleUnapprove}>
                    Restaurar
                  </PolishedButton>
                  <PolishedButton className="bg-green-600 text-white hover:bg-green-700 flex-1 text-[10px]" onClick={handleApprove}>
                    Aprobar
                  </PolishedButton>
                </div>
              ) : !activity.approved ? (
                <div className="flex gap-2">
                  <PolishedButton className="bg-green-600 text-white hover:bg-green-700 flex-1 text-[10px]" onClick={handleApprove}>
                    Aprobar
                  </PolishedButton>
                  <button onClick={handleReject} title="Rechazar" className="bg-brand-red text-white p-2 hover:bg-black transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={handleUnapprove} className="text-[9px] font-bold uppercase text-brand-red hover:underline text-left">
                  Retirar (Mover a Pendientes)
                </button>
              )}
              <button
                onClick={handlePin}
                className={cn("text-[9px] font-bold uppercase hover:underline text-left flex items-center gap-1", activity.pinned ? "text-brand-red" : "text-gray-400 hover:text-brand-red")}
              >
                {activity.pinned ? '📌 Desfijar publicación' : '📌 Fijar publicación'}
              </button>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-brand-border justify-between items-center w-full">
            <PolishedButton 
              variant="ghost" 
              onClick={() => onOpenDetail(activity, 'activities')}
              className="px-0 group cursor-pointer"
            >
              <span className="underline decoration-2 underline-offset-4 text-[10px] font-bold uppercase tracking-widest text-brand-black hover:text-brand-red">Explorar Actividad</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform inline" />
            </PolishedButton>
            {user && (activity.authorId === user.uid || isAdmin) && (
              <button onClick={handleDelete} className="px-3 py-1.5 text-gray-400 hover:text-brand-red transition-colors flex items-center justify-center border-2 border-brand-black bg-gray-50 hover:bg-white text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span className="text-[10px] font-black tracking-widest uppercase">Eliminar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </PolishedCard>
  );
}

interface AdminDashboardProps {
  projects: any[];
  works: any[];
  materials: any[];
  activities: any[];
  testimonials: any[];
  user: any;
  onOpenDetail: (item: any, type: 'projects' | 'works' | 'materials' | 'activities') => void;
  key?: any;
}

function AdminDashboard({ projects, works, materials, activities, testimonials, user, onOpenDetail }: AdminDashboardProps) {
  const confirm = useRetroConfirm();
  const [adminTab, setAdminTab] = useState<'projects' | 'works' | 'materials' | 'activities' | 'testimonials'>('works');
  const [filterMode, setFilterMode] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingProjects = projects.filter(p => !p.approved && !p.rejected);
  const pendingWorks = works.filter(w => !w.approved && !w.rejected);
  const pendingMaterials = materials.filter(m => !m.approved && !m.rejected);
  const pendingActivities = activities.filter(a => !a.approved && !a.rejected);
  const pendingTestimonials = testimonials.filter(t => !t.approved && !t.rejected);

  const stats = [
    { label: 'Creaciones', value: works.length, pending: pendingWorks.length, color: 'bg-black' },
    { label: 'Proyectos', value: projects.length, pending: pendingProjects.length, color: 'bg-brand-red' },
    { label: 'Materiales', value: materials.length, pending: pendingMaterials.length, color: 'bg-gray-400' },
    { label: 'Actividades', value: activities.length, pending: pendingActivities.length, color: 'bg-brand-red' },
    { label: 'Testimonios', value: testimonials.length, pending: pendingTestimonials.length, color: 'bg-brand-red' },
  ];

  const currentList = adminTab === 'projects' ? projects : adminTab === 'works' ? works : adminTab === 'materials' ? materials : adminTab === 'testimonials' ? testimonials : activities;
  
  const authors = Array.from(new Set(currentList.map(item => {
    if (adminTab === 'projects') return item.authorName || 'Anónimo';
    if (adminTab === 'works') return item.studentName || 'Anónimo';
    if (adminTab === 'materials') return item.teacherName || 'Prof.';
    if (adminTab === 'activities') return item.authorName || 'Anónimo';
    return 'Anónimo';
  }))).filter(Boolean).sort();

  const filteredList = currentList.filter(item => {
    // Filter mode logic
    const matchesFilter = (() => {
      if (filterMode === 'pending') return !item.approved && !item.rejected;
      if (filterMode === 'approved') return item.approved;
      if (filterMode === 'rejected') return item.rejected;
      return true;
    })();

    if (!matchesFilter) return false;

    // Author filter logic
    if (selectedAuthor) {
      const authorName = adminTab === 'projects' ? item.authorName : adminTab === 'works' ? item.studentName : adminTab === 'materials' ? item.teacherName : item.authorName;
      if (authorName !== selectedAuthor) return false;
    }

    // Search logic
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();

    const title = (item.title || '').toLowerCase();
    const description = (item.description || item.content || '').toLowerCase();
    const author = (item.authorName || item.studentName || item.teacherName || '').toLowerCase();
    const extra = (item.category || item.workType || item.subject || '').toLowerCase();

    return title.includes(term) || description.includes(term) || author.includes(term) || extra.includes(term);
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(item => item.id));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    let confirmTitle = "";
    let confirmMsg = "";
    let isDestructive = false;

    if (action === 'approve') {
      confirmTitle = "Aprobar en Lote";
      confirmMsg = `¿Deseas aprobar de forma masiva los ${selectedIds.length} elementos seleccionados? Se publicarán inmediatamente en el portal.`;
    } else if (action === 'reject') {
      confirmTitle = "Rechazar en Lote";
      confirmMsg = `¿Deseas rechazar en masa los ${selectedIds.length} elementos seleccionados? Serán trasladados al módulo de rechazados.`;
      isDestructive = true;
    } else if (action === 'delete') {
      confirmTitle = "ELIMINAR EN LOTE (MÁXIMO RIESGO)";
      confirmMsg = `⚠️ ¡PELIGRO CRÍTICO! ¿Estás absolutamente seguro de que deseas ELIMINAR PERMANENTEMENTE los ${selectedIds.length} elementos seleccionados del sistema? Esta acción no se puede deshacer de ninguna manera.`;
      isDestructive = true;
    }

    const ok = await confirm({
      title: confirmTitle,
      message: confirmMsg,
      confirmText: action === 'delete' ? "ELIMINAR TODO" : action === 'reject' ? "Rechazar todo" : "Aprobar todo",
      cancelText: "Volver atrás",
      isDestructive: isDestructive
    });

    if (!ok) return;

    setIsProcessing(true);
    const table = adminTab === 'projects' ? 'projects' : adminTab === 'works' ? 'studentWorks' : adminTab === 'materials' ? 'materials' : adminTab === 'testimonials' ? 'testimonials' : 'activities';

    try {
      if (action === 'approve') {
        await Promise.all(selectedIds.map(id => FirestoreService.update(table as any, id, { approved: true, rejected: false })));
      } else if (action === 'reject') {
        await Promise.all(selectedIds.map(id => FirestoreService.update(table as any, id, { approved: false, rejected: true })));
      } else if (action === 'delete') {
        await Promise.all(selectedIds.map(id => FirestoreService.remove(table as any, id)));
      }
      setSelectedIds([]);
    } catch (error) {
      console.error(`Bulk ${action} failed`, error);
      alert("Error al procesar la acción por lotes.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [adminTab, filterMode, searchTerm, selectedAuthor]);

  useEffect(() => {
    setSelectedAuthor('');
  }, [adminTab]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 border-2 border-brand-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">{stat.label}</span>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold tracking-tighter">{stat.value}</span>
              {stat.pending > 0 && (
                <span className="text-[9px] bg-brand-red text-white px-2 py-1 font-bold animate-pulse">
                  {stat.pending} PENDIENTES
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-brand-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        {/* Bulk Actions Floating Bar */}
          <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-black text-white px-4 sm:px-8 py-4 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] flex flex-col sm:flex-row items-center gap-4 sm:gap-8 border-2 border-brand-red"
            >
              <div className="flex items-center justify-between w-full sm:w-auto sm:block">
                <div className="flex flex-col">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest opacity-60">Seleccionados</span>
                  <span className="text-lg sm:text-xl font-bold">{selectedIds.length} ítems</span>
                </div>
                <button onClick={() => setSelectedIds([])} className="sm:hidden text-[10px] uppercase font-bold tracking-widest border border-white/20 px-3 py-1">X</button>
              </div>
              <div className="hidden sm:block h-10 w-[1px] bg-white/20"></div>
              <div className="flex flex-wrap sm:flex-nowrap justify-center gap-2 sm:gap-4 w-full sm:w-auto">
                <button 
                  disabled={isProcessing}
                  onClick={() => handleBulkAction('approve')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Aprobar</span>
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleBulkAction('reject')}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Rechazar</span>
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleBulkAction('delete')}
                  className="flex items-center gap-2 bg-brand-red hover:bg-red-800 px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Eliminar</span>
                </button>
              </div>
              <button onClick={() => setSelectedIds([])} className="hidden sm:block text-xs hover:underline opacity-60">Cancelar</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-8 mb-10 border-b border-brand-border pb-8">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div className="flex overflow-x-auto w-full xl:w-auto gap-4 pb-2 xl:pb-0 no-scrollbar">
              <button 
                onClick={() => setAdminTab('works')}
                className={cn("whitespace-nowrap text-xs font-bold uppercase tracking-widest px-4 py-2 border-b-2", adminTab === 'works' ? "border-brand-red text-brand-red" : "border-transparent opacity-40")}
              >
                Creaciones ({works.length})
              </button>
              <button 
                onClick={() => setAdminTab('projects')}
                className={cn("whitespace-nowrap text-xs font-bold uppercase tracking-widest px-4 py-2 border-b-2", adminTab === 'projects' ? "border-brand-red text-brand-red" : "border-transparent opacity-40")}
              >
                Proyectos ({projects.length})
              </button>
              <button 
                onClick={() => setAdminTab('materials')}
                className={cn("whitespace-nowrap text-xs font-bold uppercase tracking-widest px-4 py-2 border-b-2", adminTab === 'materials' ? "border-brand-red text-brand-red" : "border-transparent opacity-40")}
              >
                Recursos ({materials.length})
              </button>
              <button 
                onClick={() => setAdminTab('activities')}
                className={cn("whitespace-nowrap text-xs font-bold uppercase tracking-widest px-4 py-2 border-b-2", adminTab === 'activities' ? "border-brand-red text-brand-red" : "border-transparent opacity-40")}
              >
                Actividades ({activities.length})
              </button>
              <button 
                onClick={() => setAdminTab('testimonials')}
                className={cn("whitespace-nowrap text-xs font-bold uppercase tracking-widest px-4 py-2 border-b-2 relative", adminTab === 'testimonials' ? "border-brand-red text-brand-red" : "border-transparent opacity-40")}
              >
                Testimonios ({testimonials.length})
                {pendingTestimonials.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red text-white text-[8px] font-bold flex items-center justify-center rounded-full">{pendingTestimonials.length}</span>
                )}
              </button>
            </div>

            <div className="flex overflow-x-auto w-full xl:w-auto bg-gray-100 p-1 rounded-none border border-brand-border no-scrollbar">
              <button 
                onClick={() => setFilterMode('pending')}
                className={cn("whitespace-nowrap px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all", filterMode === 'pending' ? "bg-white text-brand-black shadow-sm" : "text-gray-400")}
              >
                Pendientes
              </button>
              <button 
                onClick={() => setFilterMode('approved')}
                className={cn("whitespace-nowrap px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all", filterMode === 'approved' ? "bg-white text-brand-black shadow-sm" : "text-gray-400")}
              >
                Aprobados
              </button>
              <button 
                onClick={() => setFilterMode('rejected')}
                className={cn("whitespace-nowrap px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all", filterMode === 'rejected' ? "bg-white text-brand-black shadow-sm" : "text-gray-400")}
              >
                Rechazados
              </button>
              <button 
                onClick={() => setFilterMode('all')}
                className={cn("whitespace-nowrap px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all", filterMode === 'all' ? "bg-white text-brand-black shadow-sm" : "text-gray-400")}
              >
                Ver Todo
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <input 
                type="text"
                placeholder="Buscar por título, autor o palabras clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-brand-border px-4 py-3 text-xs font-medium outline-none focus:border-brand-red transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select 
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full lg:w-48 bg-gray-50 border border-brand-border px-4 py-3 text-xs font-medium outline-none focus:border-brand-red transition-all cursor-pointer"
            >
              <option value="">Todos los autores</option>
              {authors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
            
            <button 
              onClick={handleSelectAll}
              className="w-full lg:w-auto px-6 py-3 border-2 border-brand-black text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              {selectedIds.length === filteredList.length && filteredList.length > 0 ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adminTab === 'testimonials' ? (
            filteredList.map(item => (
              <div key={item.id} className="border-4 border-brand-black bg-white p-6 flex flex-col gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block">Testimonio</span>
                    <span className="text-sm font-black uppercase text-brand-black">{item.name}</span>
                  </div>
                  <span className={cn("text-[8px] font-black uppercase px-2 py-1", item.approved ? "bg-green-100 text-green-800" : item.rejected ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800")}>
                    {item.approved ? 'Aprobado' : item.rejected ? 'Rechazado' : 'Pendiente'}
                  </span>
                </div>
                <div className="inline-block px-2 py-1 text-[9px] font-bold uppercase tracking-widest bg-brand-red text-white self-start">
                  {item.role}
                </div>
                <CardMediaPreview 
                  attachmentUrl={item.attachmentUrl} 
                  attachmentType={item.attachmentType} 
                  attachmentName={item.attachmentName} 
                  imageUrl={item.imageUrl} 
                  driveLink={item.driveLink} 
                />
                <p className="text-xs text-gray-700 leading-relaxed border-l-4 border-brand-red pl-4 py-2 bg-brand-bg">
                  {item.content}
                </p>
                <div className="flex gap-2 pt-2 border-t border-brand-border flex-wrap">
                  {!item.approved && !item.rejected && (
                    <button onClick={() => FirestoreService.update('testimonials', item.id, { approved: true, rejected: false })} className="flex-1 bg-green-600 text-white text-[9px] font-bold uppercase py-2 hover:bg-green-700 transition-colors">
                      Aprobar
                    </button>
                  )}
                  {!item.rejected && (
                    <button onClick={() => FirestoreService.update('testimonials', item.id, { approved: false, rejected: true })} className="flex-1 bg-yellow-500 text-white text-[9px] font-bold uppercase py-2 hover:bg-yellow-600 transition-colors">
                      Rechazar
                    </button>
                  )}
                  {item.rejected && (
                    <button onClick={() => FirestoreService.update('testimonials', item.id, { approved: false, rejected: false })} className="flex-1 bg-blue-600 text-white text-[9px] font-bold uppercase py-2 hover:bg-blue-700 transition-colors">
                      Restaurar
                    </button>
                  )}
                  <button 
                    onClick={() => FirestoreService.update('testimonials', item.id, { pinned: !item.pinned })}
                    className={cn("px-3 py-2 text-[9px] font-bold uppercase border transition-all flex items-center gap-1", item.pinned ? "border-brand-red bg-brand-red text-white hover:bg-brand-black hover:border-brand-black" : "border-gray-200 text-gray-400 hover:text-brand-red hover:border-brand-red")}
                  >
                    📌 {item.pinned ? 'Desfijar' : 'Fijar'}
                  </button>
                  <button onClick={() => FirestoreService.remove('testimonials', item.id)} className="px-3 py-2 text-gray-400 hover:text-brand-red border border-gray-200 hover:border-brand-red transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            filteredList.map(item => (
            <div key={item.id} className="relative group">
              {adminTab === 'projects' && (
                <ProjectCard 
                  project={item} 
                  user={user} 
                  onOpenDetail={onOpenDetail}
                  isSelected={selectedIds.includes(item.id)} 
                  onSelect={toggleSelect} 
                />
              )}
              {adminTab === 'works' && (
                <WorkCard 
                  work={item} 
                  user={user} 
                  onOpenDetail={onOpenDetail}
                  isSelected={selectedIds.includes(item.id)} 
                  onSelect={toggleSelect} 
                />
              )}
              {adminTab === 'materials' && (
                <MaterialCard 
                  material={item} 
                  user={user} 
                  onOpenDetail={onOpenDetail}
                  isSelected={selectedIds.includes(item.id)} 
                  onSelect={toggleSelect} 
                />
              )}
              {adminTab === 'activities' && (
                <ActivityCard 
                  activity={item} 
                  user={user} 
                  onOpenDetail={onOpenDetail}
                  isSelected={selectedIds.includes(item.id)} 
                  onSelect={toggleSelect} 
                />
              )}
            </div>
          ))
          )}
          {filteredList.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-brand-border">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">No hay contenido en esta sección</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-32 text-center border-2 border-brand-border bg-white group hover:border-brand-red transition-colors">
      <div className="w-12 h-12 bg-gray-50 flex items-center justify-center mx-auto mb-6 rotate-45 group-hover:rotate-0 transition-transform duration-500">
        <Grid className="w-4 h-4 text-gray-300 group-hover:text-brand-red" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400 group-hover:text-brand-black transition-colors">{text}</p>
    </div>
  );
}

function TestimonialsView({ testimonials, user }: { testimonials: Testimonial[]; user: any }) {
  const [formData, setFormData] = useState({ name: '', role: 'Estudiante', content: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) return;
    setLoading(true);
    try {
      await FirestoreService.create('testimonials', {
        name: formData.name.trim(),
        role: formData.role,
        content: formData.content.trim(),
        approved: false,
        rejected: false,
        authorId: user?.uid || null,
        createdAt: new Date()
      });
      setSubmitted(true);
      setFormData({ name: '', role: 'Estudiante', content: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
      {/* Header */}
      <div className="max-w-4xl">
        <span className="text-brand-red font-mono text-xs uppercase tracking-[0.4em] font-bold block mb-2">Voces de la comunidad</span>
        <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
          Testimonios
        </h3>
        <p className="text-sm text-gray-600 font-medium max-w-xl leading-relaxed">
          Palabras de quienes forman parte de esta comunidad educativa. El estudiantado, apoderados/as, egresados/as y la comunidad vecinal comparten sus experiencias.
        </p>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <EmptyState text="No hay testimonios publicados todavía. ¡Sé el primero en compartir tu experiencia!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-4 border-brand-black bg-white p-6 flex flex-col gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[14px_14px_0px_0px_rgba(191,49,49,1)] hover:translate-y-[-4px] transition-all duration-300 relative group"
            >
              {t.pinned && (
                <span className="absolute top-3 right-3 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-brand-red text-white animate-pulse">📌 FIJADO</span>
              )}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-black text-white flex items-center justify-center font-black text-lg uppercase font-mono shrink-0 border-2 border-brand-red">
                  {t.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black uppercase text-brand-black truncate">{t.name}</span>
                  <span className="inline-block px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest bg-brand-red text-white self-start mt-1">{t.role}</span>
                </div>
              </div>
              <div className="relative p-4 bg-brand-bg border-l-4 border-brand-red flex-grow">
                <CardMediaPreview 
                  attachmentUrl={t.attachmentUrl} 
                  attachmentType={t.attachmentType} 
                  attachmentName={t.attachmentName} 
                  imageUrl={t.imageUrl} 
                  driveLink={t.driveLink} 
                />
                <span className="text-4xl font-serif text-brand-red leading-none absolute top-0 left-2 select-none opacity-20">"</span>
                <p className="text-sm text-gray-800 font-medium leading-relaxed pt-3">
                  {t.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit Form */}
      <div className="border-t-4 border-brand-black pt-16">
        <div className="max-w-2xl">
          <span className="text-brand-red font-mono text-xs uppercase tracking-[0.4em] font-bold block mb-2">Comparte tu experiencia</span>
          <h4 className="text-3xl font-black uppercase tracking-tighter mb-8">Dejar un Testimonio</h4>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-green-50 border-4 border-green-600 text-center"
            >
              <div className="text-4xl mb-4">✅</div>
              <p className="font-black uppercase tracking-widest text-green-800 text-sm mb-2">¡Testimonio enviado!</p>
              <p className="text-xs text-green-700">Tu testimonio está en revisión. Será publicado una vez que el equipo lo apruebe.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-[10px] font-bold uppercase tracking-widest text-green-700 underline hover:no-underline">
                Enviar otro testimonio
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Tu nombre"
                    className="w-full border-2 border-brand-black px-4 py-3 text-sm font-medium outline-none focus:border-brand-red transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">¿Quién eres?</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full border-2 border-brand-black px-4 py-3 text-sm font-medium outline-none focus:border-brand-red transition-all bg-white cursor-pointer"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Tu testimonio *</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                  rows={5}
                  placeholder="Comparte tu experiencia en el Liceo Eugenio Pereira Salas..."
                  className="w-full border-2 border-brand-black px-4 py-3 text-sm font-medium outline-none focus:border-brand-red transition-all resize-none"
                />
              </div>
              <PolishedButton
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.content.trim()}
                className="bg-brand-red text-white border-none px-8 py-4 text-[10px] font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? 'Enviando...' : 'Enviar Testimonio'}
              </PolishedButton>
              <p className="text-[9px] text-gray-400 font-mono">Tu testimonio será revisado antes de publicarse.</p>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AboutSection() {
  const [selectedPrinciple, setSelectedPrinciple] = useState<{
    title: string;
    text: string;
    fullText: string;
    icon: React.ReactNode;
    badge: string;
  } | null>(null);



  const principles = [
    {
      title: "Democratización",
      text: "Todo el material es de libre acceso y descarga.",
      fullText: "Creemos firmemente que la educación y el conocimiento pedagógico deben ser un bien común y universal. El acceso a las creaciones, investigaciones, planificaciones y materiales de este portal no requiere de barreras económicas ni de suscripciones. Facilitamos la descarga libre de recursos de calidad para que el profesorado, el estudiantado y comunidades organizadas puedan reutilizarlos y adaptarlos a sus propios contextos territoriales.",
      icon: <Globe className="w-8 h-8 text-brand-red shrink-0" />,
      badge: "Acceso Común"
    },
    {
      title: "Pertinencia",
      text: "Contenidos que responden a la realidad de la clase trabajadora.",
      fullText: "La educación cobra sentido cuando se sitúa en la historia y experiencia de vida de la comunidad estudiantil. Desarrollamos reflexiones pedagógicas y proyectos de investigación que conectan directamente con problemáticas laborales, habitacionales, de género, socioambientales e históricas del territorio de la clase trabajadora. Esto transforma las aulas en espacios de producción intelectual viva y colectiva, distanciándose del currículum nacional estandarizado y descontextualizado.",
      icon: <Compass className="w-8 h-8 text-brand-red shrink-0" />,
      badge: "Pedagogía de Contexto Territorial"
    },
    {
      title: "Resistencia",
      text: "Contra la invisibilización de la educación vespertina.",
      fullText: "La educación de personas jóvenes y adultas (EPJA) ha sido históricamente relegada e invisibilizada por las políticas públicas estandarizadas. Nos posicionamos en resistencia activa frente a esta exclusión, reivindicando las aulas nocturnas no solo como espacios de nivelación de estudios, sino como núcleos vibrantes de debate crítico, asociatividad, memoria histórica colectiva, solidaridad y transformación social.",
      icon: <Flame className="w-8 h-8 text-brand-red shrink-0" />,
      badge: "EPJA en Rebelión Teórica"
    },
    {
      title: "Creación",
      text: "Fomentamos la producción de cultura propia.",
      fullText: "Rechazamos firmemente la idea de que los sectores populares son meros consumidores pasivos de cultura ajena. Impulsamos metodologías pedagógicas críticas que sitúan al estudiantado en el rol activo de creadores y productores intelectuales de conocimiento, literatura, arte, tecnología y soluciones comunitarias reales. Fomentamos que la autoría se construya desde la propia voz auténtica de nuestra comunidad.",
      icon: <Lightbulb className="w-8 h-8 text-brand-red shrink-0" />,
      badge: "Autores de Nuestra Historia"
    }
  ];

  return (
    <div className="max-w-5xl space-y-32">
      <section className="relative overflow-hidden">
        <div className="absolute -left-4 sm:-left-12 top-0 text-[80px] sm:text-[120px] font-bold text-gray-100/50 leading-none select-none pointer-events-none -z-10">01</div>
        <span className="text-[11px] font-bold text-brand-red uppercase tracking-[0.4em] block mb-6">Manifiesto</span>
        <h2 className="text-4xl sm:text-7xl font-bold tracking-tighter uppercase mb-12 max-w-4xl leading-[0.85]">
          La tecnología como una herramienta de <span className="text-brand-red italic font-serif normal-case">Aprendizaje</span> y Emancipación.
        </h2>
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 text-base md:text-lg text-gray-700 leading-relaxed font-serif italic max-w-4xl">
          <p>
            Este espacio digital se concibe como una red de aprendizajes, conocimientos, resultados y demostraciones pedagógicas donde el estudiantado es protagonista al exponer sus propios trabajos.
          </p>
          <p>
            A través de esta vitrina colectiva, el objetivo primordial de cada creación e investigación estudiantil es develar las violencias estructurales que vivimos, transformando la tecnología en una herramienta de aprendizaje, emancipación y justicia social.
          </p>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-1 px-1 bg-brand-border">
        <AboutStat label="Justicia" value="Equidad" desc="Acceso al conocimiento pedagógico." />
        <AboutStat label="Voz" value="Identidad" desc="El estudiantado como autor de su historia." />
        <AboutStat label="Red" value="Comunidad" desc="El profesorado compartiendo para transformar." />
      </section>

      <section className="bg-brand-red text-white p-16 md:p-24 rotate-1">
        <div className="rotate-[-1deg]">
          <h3 className="text-5xl font-bold tracking-tighter uppercase mb-2">Principios Activos</h3>
          <p className="text-[10px] uppercase font-mono tracking-widest text-white/70 mb-12 font-bold italic">Presiona en cada principio para ver detalles del manifiesto</p>
          <div className="grid sm:grid-cols-2 gap-12">
            {principles.map((pr) => (
              <Principle 
                key={pr.title} 
                title={pr.title} 
                text={pr.text} 
                onClick={() => setSelectedPrinciple(pr)} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Retro-brutalist Modal Overlay for Active Principles */}
      <AnimatePresence>
        {selectedPrinciple && (
          <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            {/* Modal Backdrop closer */}
            <div className="absolute inset-0" onClick={() => setSelectedPrinciple(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative bg-white text-brand-black max-w-lg w-full border-4 border-brand-black p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(188,33,34,1)] z-10 flex flex-col gap-6"
            >
              {/* Close corner X button */}
              <button
                onClick={() => setSelectedPrinciple(null)}
                className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center border-4 border-brand-black bg-white select-none hover:bg-brand-red hover:text-white font-extrabold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                title="Cerrar"
              >
                ✕
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-bg border-2 border-brand-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {selectedPrinciple.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-red">
                      Principio Activo EPJA
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
                      {selectedPrinciple.badge}
                    </span>
                  </div>
                </div>

                <h4 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase mb-2 border-b-2 border-brand-black pb-2 text-brand-black">
                  {selectedPrinciple.title}
                </h4>

                <p className="text-base font-bold text-brand-red leading-relaxed uppercase tracking-tight font-sans">
                  "{selectedPrinciple.text}"
                </p>

                <div className="p-5 bg-brand-bg border-l-4 border-brand-red font-serif italic text-gray-700 text-sm leading-relaxed md:text-base">
                  {selectedPrinciple.fullText}
                </div>
              </div>

              <div className="pt-4 border-t-2 border-dashed border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                  Sello Epistemológico Liceo EPS
                </div>
                <PolishedButton
                  onClick={() => setSelectedPrinciple(null)}
                  className="w-full sm:w-auto bg-brand-black text-white hover:bg-brand-red shadow-[4px_4px_0px_0px_rgba(188,33,34,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Cerrar Principio
                </PolishedButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AboutStat({ label, value, desc }: { label: string, value: string, desc: string }) {
  return (
    <div className="bg-brand-bg p-12 hover:bg-white transition-colors">
      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-red mb-4">{label}</div>
      <div className="text-5xl font-bold tracking-tighter uppercase mb-4">{value}</div>
      <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function Principle({ title, text, onClick }: { title: string, text: string, onClick: () => void, key?: any }) {
  return (
    <div 
      onClick={onClick}
      className="space-y-2 cursor-pointer group select-none hover:bg-white/10 p-4 -m-4 transition-colors duration-200 border border-transparent hover:border-white/10 relative rounded-sm"
    >
      <div className="text-xl font-bold uppercase tracking-tighter border-b border-white/20 pb-2 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-[9px] font-mono tracking-widest text-white/50 group-hover:text-white group-hover:underline transition-all">LEER MÁS →</span>
      </div>
      <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90 transition-colors">{text}</p>
    </div>
  );
}

function ContentForm({ onSuccess, onCancel, user, isAdmin = false, forcedType }: { onSuccess: (subType: 'projects' | 'works' | 'materials' | 'activities' | 'testimonials') => void, onCancel: () => void, user: User | null, isAdmin?: boolean, forcedType?: 'projects' | 'works' | 'materials' | 'activities' | 'testimonials' }) {
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<'projects' | 'works' | 'materials' | 'activities' | 'testimonials'>(forcedType || 'works');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (forcedType) {
      setContentType(forcedType);
    }
  }, [forcedType]);

  // Reset file on type change
  useEffect(() => {
    setUploadedFile(null);
    setUploadedUrl('');
    setUploadProgress(null);
  }, [contentType]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadProgress(0);

    const ext = file.name.split('.').pop();
    const safeName = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const storageRef = ref(storage, safeName);
    const task = uploadBytesResumable(storageRef, file);

    // Timeout de 6 segundos en caso de que se quede pegado en 0% (común si Firebase Storage no está activado o bloqueado)
    const timeoutId = setTimeout(() => {
      task.cancel();
      setUploadProgress(null);
      setUploadedFile(null);
      alert('El servidor de almacenamiento no responde (Firebase Storage no activado o sin permisos de escritura en este proyecto sandbox).\n\nPor favor, sube tu archivo a Google Drive o Dropbox y usa la casilla de "Enlace de Drive" en el formulario para compartirlo con la comunidad.');
    }, 6000);

    task.on('state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setUploadProgress(pct);
        if (pct > 0) {
          clearTimeout(timeoutId);
        }
      },
      (err) => {
        clearTimeout(timeoutId);
        if (err.code !== 'storage/canceled') {
          console.error('Upload error', err);
          alert('Error al subir el archivo: ' + err.message + '\n\nTe recomendamos subir el archivo a Google Drive y usar la casilla "Enlace de Drive" en el formulario.');
        }
        setUploadProgress(null);
        setUploadedFile(null);
      },
      async () => {
        clearTimeout(timeoutId);
        const url = await getDownloadURL(task.snapshot.ref);
        setUploadedUrl(url);
        setUploadProgress(100);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploadProgress !== null && uploadProgress < 100) {
      alert('El archivo aún se está subiendo. Por favor espera.');
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const common = {
        approved: false, // Set to false initially to comply with Firestore creation rules
        authorId: user?.uid || 'guest',
        createdAt: new Date(),
        ...(uploadedUrl ? { 
          attachmentUrl: uploadedUrl,
          attachmentType: uploadedFile?.type || '',
          attachmentName: uploadedFile?.name || ''
        } : {}),
      };

      let newDoc;
      if (contentType === 'projects') {
        newDoc = await FirestoreService.create('projects', {
          ...data,
          ...common,
          authorName: user?.displayName || 'Anónimo',
        });
      } else if (contentType === 'works') {
        newDoc = await FirestoreService.create('studentWorks', {
          ...data,
          ...common,
        });
      } else if (contentType === 'materials') {
        newDoc = await FirestoreService.create('materials', {
          ...data,
          ...common,
          teacherName: (data.teacherName as string)?.trim() || user?.displayName || 'Prof.'
        });
      } else if (contentType === 'activities') {
        newDoc = await FirestoreService.create('activities', {
          ...data,
          ...common,
        });
      } else if (contentType === 'testimonials') {
        newDoc = await FirestoreService.create('testimonials', {
          ...data,
          ...common,
        });
      }

      // If the submitter is admin, auto-approve the document immediately in a second step
      if (isAdmin && newDoc && newDoc.id) {
        const collectionPath = contentType === 'works' ? 'studentWorks' : contentType;
        await FirestoreService.update(collectionPath, newDoc.id, { approved: true });
      }
      onSuccess(contentType);
      if (isAdmin) {
        alert('¡Publicado con éxito como Administrador!');
      } else {
        alert('Enviado con éxito. Un administrador revisará tu publicación pronto.');
      }
    } catch (error) {
      console.error(error);
      alert('Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const getFormTitle = () => {
    if (contentType === 'works') return isAdmin ? 'Publicar Nueva Creación Estudiantil' : 'Compartir Creación Estudiantil';
    if (contentType === 'projects') return isAdmin ? 'Publicar Nuevo Proyecto' : 'Compartir Proyecto de Investigación';
    if (contentType === 'materials') return isAdmin ? 'Publicar Nuevo Recurso' : 'Compartir Recurso';
    if (contentType === 'activities') return isAdmin ? 'Publicar Nueva Actividad Comunitaria' : 'Compartir Actividad Comunitaria';
    if (contentType === 'testimonials') return isAdmin ? 'Publicar Nuevo Testimonio' : 'Compartir Testimonio o Experiencia';
    return 'Compartir Conocimiento';
  };

  return (
    <div className="relative">
      <PolishedCard title={getFormTitle()} className="relative pr-16">
        <button 
          type="button"
          onClick={onCancel}
          className="absolute top-6 right-6 text-gray-400 hover:text-brand-red p-2 transition-colors cursor-pointer z-20"
          title="Cerrar y volver atrás"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 rounded">
          {(['works', 'projects', 'activities', 'materials', 'testimonials'] as const).map(t => (
            <button
              key={t}
              onClick={() => setContentType(t)}
              type="button"
              className={cn(
                'flex-1 py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all px-1 whitespace-nowrap',
                contentType === t ? 'bg-brand-black text-white shadow-lg' : 'text-gray-400 hover:text-brand-black'
              )}
            >
              {t === 'works' ? 'Creaciones estudiantiles' : t === 'projects' ? 'Proyectos' : t === 'activities' ? 'Actividades' : t === 'materials' ? 'Recursos' : 'Testimonios'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {contentType === 'projects' && (
            <div className="space-y-4">
              <FormInput name="title" label="Título del Proyecto" required />
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400">Asignatura</label>
                <select name="category" required className="bg-white border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-red">
                  {ASIGNATURAS.map(asig => (
                    <option key={asig} value={asig}>{asig}</option>
                  ))}
                </select>
              </div>
              <FormTextarea name="description" label="Descripción Breve" required />
              <FormInput name="driveLink" label="Enlace de Drive / Recurso externo (opcional)" placeholder="https://drive.google.com/..." type="url" icon={<Link2 className="w-4 h-4" />} />
            </div>
          )}

          {contentType === 'works' && (
            <div className="space-y-4">
              <FormInput name="title" label="Título del Trabajo" required />
              <FormInput name="studentName" label="Nombre del o de la Estudiante" required />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Asignatura</label>
                  <select name="workType" required className="bg-white border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-red">
                    {ASIGNATURAS.map(asig => (
                      <option key={asig} value={asig}>{asig}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Curso o Nivel</label>
                  <select name="year" required className="bg-white border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-red">
                    {CURSOS.map(curso => (
                      <option key={curso} value={curso}>{curso}</option>
                    ))}
                  </select>
                </div>
              </div>
              <FormInput name="driveLink" label="Enlace de Drive / Google Docs (opcional)" placeholder="https://drive.google.com/..." type="url" icon={<Link2 className="w-4 h-4" />} />
              <FormTextarea name="content" label="Resumen o Contenido" required />
            </div>
          )}

          {contentType === 'materials' && (
            <div className="space-y-4">
              <FormInput name="title" label="Título del Recurso" required />
              <FormInput name="teacherName" label="Profesor/a (Opcional)" placeholder="Ej: Prof. María López" />
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400">Asignatura</label>
                <select name="subject" required className="bg-white border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-red">
                  {ASIGNATURAS.map(asig => (
                    <option key={asig} value={asig}>{asig}</option>
                  ))}
                </select>
              </div>
              <FormInput name="driveLink" label="Enlace de Drive / Recurso externo (opcional)" placeholder="https://drive.google.com/..." type="url" icon={<Link2 className="w-4 h-4" />} />
              <FormTextarea name="description" label="Uso Pedagógico" />
            </div>
          )}

          {contentType === 'activities' && (
            <div className="space-y-4">
              <FormInput name="title" label="Título de la Actividad" required />
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400">Asignatura Colectiva / Comunidad</label>
                <select name="category" required className="bg-white border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-red">
                  <option value="Comunidad">Comunidad / General</option>
                  {ASIGNATURAS.map(asig => (
                    <option key={asig} value={asig}>{asig}</option>
                  ))}
                </select>
              </div>
              <FormTextarea name="description" label="Una breve descripción" required />
              <FormInput name="driveLink" label="Enlace de Drive / Recurso externo (opcional)" placeholder="https://drive.google.com/..." type="url" icon={<Link2 className="w-4 h-4" />} />
              <FormInput name="imageUrl" label="Enlace de la Imagen (Opcional)" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>
          )}

          {contentType === 'testimonials' && (
            <div className="space-y-4">
              <FormInput name="name" label="Nombre Completo" required />
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400">Rol o Estamento</label>
                <select name="role" required className="bg-white border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-red">
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <FormTextarea name="content" label="Tu Testimonio / Experiencia" required />
              <FormInput name="driveLink" label="Enlace de Drive / Google Docs (opcional)" placeholder="https://drive.google.com/..." type="url" icon={<Link2 className="w-4 h-4" />} />
              <FormInput name="imageUrl" label="Enlace de la Imagen (Opcional)" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>
          )}

          {/* ── File Upload Section ─────────────────────────── */}
          <div className="border-2 border-dashed border-brand-border rounded p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Adjuntar Documento / PDF / Imagen</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mov,.webm,.ogg"
              className="hidden"
              onChange={handleFileSelect}
            />

            {!uploadedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 py-4 px-5 border-2 border-brand-black bg-white text-brand-black text-[11px] font-bold uppercase tracking-wider hover:bg-brand-black hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
              >
                <UploadCloud className="w-5 h-5" />
                Seleccionar archivo (PDF, imagen, documento…)
              </button>
            ) : (
              <div className="space-y-4">
                {/* Visual File Preview */}
                {(() => {
                  const isImage = uploadedFile.type.startsWith('image/');
                  const isVideo = uploadedFile.type.startsWith('video/');
                  const previewUrl = URL.createObjectURL(uploadedFile);

                  if (isImage) {
                    return (
                      <div className="w-full aspect-video border-4 border-brand-black bg-brand-bg overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                      </div>
                    );
                  }
                  if (isVideo) {
                    return (
                      <div className="w-full aspect-video border-4 border-brand-black bg-brand-black overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <video src={previewUrl} controls className="w-full h-full object-cover" />
                      </div>
                    );
                  }
                  return (
                    <div className="w-full p-4 border-4 border-brand-black bg-brand-bg flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <FileIcon className="w-10 h-10 text-brand-red shrink-0" />
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-black uppercase truncate text-brand-black">{uploadedFile.name}</p>
                        <p className="text-[9px] font-mono uppercase text-gray-400">DOCUMENTO ADJUNTO · {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-brand-border">
                  <FileIcon className="w-5 h-5 text-brand-red shrink-0" />
                  <span className="text-xs text-gray-700 truncate flex-1">{uploadedFile.name}</span>
                  {uploadProgress === 100 ? (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setUploadedFile(null); setUploadedUrl(''); setUploadProgress(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-gray-400 hover:text-brand-red cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {uploadProgress !== null && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-gray-200 rounded overflow-hidden">
                      <div
                        className="h-full bg-brand-red transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 text-right">Subiendo… {uploadProgress}%</p>
                  </div>
                )}

                {uploadProgress === 100 && (
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">✓ Archivo subido correctamente</p>
                )}

                {uploadProgress === 100 && (
                  <button
                    type="button"
                    onClick={() => { setUploadedFile(null); setUploadedUrl(''); setUploadProgress(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-[10px] text-gray-400 underline hover:text-brand-red cursor-pointer"
                  >
                    Cambiar archivo
                  </button>
                )}
              </div>
            )}

            <p className="text-[10px] text-gray-400">
              Formatos aceptados: PDF, Word, Excel, PowerPoint, imágenes (JPG, PNG, etc.) · Máx. 20 MB
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <PolishedButton type="submit" className="w-full bg-brand-red text-white" disabled={loading || (uploadProgress !== null && uploadProgress < 100)}>
              {loading ? 'Procesando...' : uploadProgress !== null && uploadProgress < 100 ? `Subiendo archivo ${uploadProgress}%…` : isAdmin ? 'Publicar Ahora' : 'Enviar para Revisión'}
            </PolishedButton>
          </div>
        </form>
      </PolishedCard>
    </div>
  );
}

function FormInput({ label, icon, ...props }: { label: string; icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase text-gray-400">{label}</label>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-gray-400 pointer-events-none">{icon}</span>
        )}
        <input 
          className={cn(
            "bg-white border border-brand-border py-2 text-sm outline-none focus:border-brand-red transition-colors w-full",
            icon ? "pl-9 pr-3" : "px-3"
          )}
          {...props} 
        />
      </div>
    </div>
  );
}

function FormTextarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase text-gray-400">{label}</label>
      <textarea 
        className="bg-white border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-red transition-colors min-h-[100px]" 
        {...props} 
      />
    </div>
  );
}

function FilterBar({ 
  selected, 
  onSelect 
}: { 
  selected: string | null; 
  onSelect: (val: string | null) => void; 
}) {
  return (
    <div className="flex overflow-x-auto gap-2 mb-12 border-b border-brand-border pb-8 pt-[3px] no-scrollbar scroll-smooth">
      <button 
        onClick={() => onSelect(null)}
        className={cn(
          "whitespace-nowrap px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 shrink-0",
          selected === null 
            ? "bg-brand-black text-white border-brand-black shadow-[3px_3px_0px_0px_rgba(188,33,34,1)]" 
            : "bg-white text-gray-400 border-brand-border hover:border-brand-black hover:text-brand-black"
        )}
      >
        Todos
      </button>
      {ASIGNATURAS.map(asig => (
        <button 
          key={asig}
          onClick={() => onSelect(asig)}
          className={cn(
            "whitespace-nowrap px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 shrink-0",
            selected === asig 
              ? "bg-brand-red text-white border-brand-red shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" 
              : "bg-white text-gray-400 border-brand-border hover:border-brand-red hover:text-brand-red"
          )}
        >
          {asig === "P.I.E. (Programa de Integración Escolar)" ? "P.I.E." : asig}
        </button>
      ))}
    </div>
  );
}

function CourseFilterBar({ 
  selected, 
  onSelect 
}: { 
  selected: string | null; 
  onSelect: (val: string | null) => void; 
}) {
  return (
    <div className="flex overflow-x-auto gap-2 mb-12 border-b border-brand-border pb-8 pt-[3px] no-scrollbar scroll-smooth">
      <button 
        onClick={() => onSelect(null)}
        className={cn(
          "whitespace-nowrap px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 shrink-0",
          selected === null 
            ? "bg-brand-black text-white border-brand-black shadow-[3px_3px_0px_0px_rgba(188,33,34,1)]" 
            : "bg-white text-gray-400 border-brand-border hover:border-brand-black hover:text-brand-black"
        )}
      >
        Todos los Cursos
      </button>
      {CURSOS.map(curso => (
        <button 
          key={curso}
          onClick={() => onSelect(curso)}
          className={cn(
            "whitespace-nowrap px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 shrink-0",
            selected === curso 
              ? "bg-brand-red text-white border-brand-red shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" 
              : "bg-white text-gray-400 border-brand-border hover:border-brand-red hover:text-brand-red"
          )}
        >
          {curso}
        </button>
      ))}
    </div>
  );
}

interface CompiledItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  parentType: 'projects' | 'works' | 'materials' | 'activities';
  categoryLabel: string;
  categoryValue?: string;
  studentName?: string;
  teacherName?: string;
  subject?: string;
  year?: string;
  imageUrl?: string;
  isDummy?: boolean;
  driveLink?: string;
  link?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  authorName?: string;
  createdAt?: any;
}

function ResumenPublicaciones({
  visibleWorks,
  visibleProjects,
  visibleMaterials,
  visibleActivities,
  onOpenDetail
}: {
  visibleWorks: any[];
  visibleProjects: any[];
  visibleMaterials: any[];
  visibleActivities: any[];
  onOpenDetail: (item: any, type: 'projects' | 'works' | 'materials' | 'activities') => void;
}) {
  // Combine all actual database approved items
  let items: CompiledItem[] = [
    ...visibleProjects.map(p => ({ 
      id: p.id, 
      title: p.title, 
      description: p.description, 
      parentType: 'projects' as const, 
      categoryLabel: 'PROYECTOS',
      categoryValue: p.category,
      imageUrl: p.imageUrl,
      driveLink: p.driveLink,
      attachmentUrl: p.attachmentUrl,
      attachmentType: p.attachmentType,
      attachmentName: p.attachmentName,
      authorName: p.authorName,
      createdAt: p.createdAt
    })),
    ...visibleWorks.map(w => ({ 
      id: w.id, 
      title: w.title, 
      description: w.content || w.description, 
      parentType: 'works' as const, 
      categoryLabel: 'CREACIONES ESTUDIANTILES',
      categoryValue: w.workType,
      studentName: w.studentName,
      year: w.year,
      imageUrl: w.imageUrl,
      link: w.link,
      driveLink: w.driveLink,
      attachmentUrl: w.attachmentUrl,
      attachmentType: w.attachmentType,
      attachmentName: w.attachmentName,
      createdAt: w.createdAt
    })),
    ...visibleMaterials.map(m => ({ 
      id: m.id, 
      title: m.title, 
      description: m.description, 
      parentType: 'materials' as const, 
      categoryLabel: 'RECURSOS',
      categoryValue: m.subject,
      teacherName: m.teacherName,
      driveLink: m.driveLink,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType,
      attachmentName: m.attachmentName,
      createdAt: m.createdAt
    })),
    ...visibleActivities.map(a => ({ 
      id: a.id, 
      title: a.title, 
      description: a.description, 
      parentType: 'activities' as const, 
      categoryLabel: 'ACTIVIDADES',
      categoryValue: a.category,
      imageUrl: a.imageUrl,
      driveLink: a.driveLink,
      attachmentUrl: a.attachmentUrl,
      attachmentType: a.attachmentType,
      attachmentName: a.attachmentName,
      createdAt: a.createdAt
    }))
  ];

  // If there are no uploaded items, supply gorgeous high-fidelity demonstration cards (representing what happens when content is uploaded)
  const dummyItems: CompiledItem[] = [
    {
      id: 'dummy1',
      title: 'Revista de Memorias Populares y Críticas Social',
      description: 'Una recopilación independiente de microcuentos y reflexiones estudiantiles del curso de Estudios Sociales sobre los barrios históricos capitalinos.',
      parentType: 'works',
      categoryLabel: 'CREACIONES ESTUDIANTILES',
      categoryValue: 'Estudios Sociales',
      studentName: 'Colectivo 3ro Medio',
      year: '2026',
      isDummy: true
    },
    {
      id: 'dummy2',
      title: 'Investigación Estructuras Autónomas en Física Aplicada',
      description: 'Proyecto del área de Ciencias Naturales enfocado en el análisis matemático-físico de la transferencia térmica en viviendas sustentables.',
      parentType: 'projects',
      categoryLabel: 'PROYECTOS',
      categoryValue: 'Ciencias Naturales',
      isDummy: true
    },
    {
      id: 'dummy3',
      title: 'Guía de Educación Cívica y Derechos Territoriales',
      description: 'Folleto didáctico pedagógico diseñado para el análisis crítico de la legislación local y la participación barrial activa en comunidades vulneradas.',
      parentType: 'materials',
      categoryLabel: 'RECURSOS',
      categoryValue: 'Estudios Sociales',
      teacherName: 'Prof. Javiera Araya',
      isDummy: true
    },
    {
      id: 'dummy4',
      title: 'Corrida Escolar EPJA por la Salud e Integridad Comunitaria',
      description: 'Registro histórico fotográfico de la jornada participativa de acondicionamiento físico y recreación colectiva organizada por la comunidad estudiantil vespertina.',
      parentType: 'activities',
      categoryLabel: 'ACTIVIDADES',
      categoryValue: 'Educación Física',
      isDummy: true
    }
  ];

  const hasRealItems = items.length > 0;
  const activeItems = hasRealItems ? items : dummyItems;

  const handleCardClick = (item: CompiledItem) => {
    onOpenDetail(item, item.parentType);
  };

  // Duplicate items for seamless continuous scrolling ticker effect
  const tickerItems = [...activeItems, ...activeItems, ...activeItems];

  return (
    <div className="space-y-16 py-8">
      {/* 1. COMPILADO DE NOVEDADES SECTION Header (Título) */}
      <div className="max-w-4xl">
        <span className="text-brand-red font-mono text-xs uppercase tracking-[0.4em] font-bold block mb-2">Red de conocimiento</span>
        <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
          Nuestra comunidad
        </h3>
      </div>

      {/* 2. Endless Scrolling Marquee Banner (El Giro) */}
      <div className="bg-brand-black text-white border-y-4 border-brand-black py-4 overflow-hidden relative select-none">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-brand-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none" />
        
        <div className="flex whitespace-nowrap animate-marquee">
          {tickerItems.map((item, idx) => (
            <div 
              key={`${item.id}-ticker-${idx}`} 
              onClick={() => handleCardClick(item)}
              className="inline-flex items-center mx-8 cursor-pointer group hover:text-brand-red transition-colors"
            >
              <span className="inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-brand-red text-white mr-3">
                {item.categoryLabel}
              </span>
              <span className="font-sans font-bold text-sm tracking-tight uppercase group-hover:underline">
                {item.title}
              </span>
              <span className="text-gray-500 font-mono text-xs mx-4">★</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Horizontal Showcase Carousel (Autoplay) */}
      <RetroCarousel itemCount={activeItems.length} autoplay={true} autoplayInterval={4000}>
        {activeItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => handleCardClick(item)}
            className="flex-shrink-0 w-[280px] sm:w-[320px] flex flex-col justify-between p-6 border-4 border-brand-black bg-white hover:border-brand-red cursor-pointer transition-all duration-300 hover:translate-y-[-6px] hover:translate-x-[-2px] relative group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(188,33,34,1)] min-h-[340px] snap-start"
          >
            {item.isDummy && (
              <span className="absolute top-2 right-2 bg-yellow-100 border border-yellow-400 text-yellow-800 text-[8px] font-bold px-1 py-0.5 rounded">
                DEMO
              </span>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-red" />
                <span className="text-[10px] font-black tracking-wider text-brand-red uppercase">
                  {item.categoryLabel}
                </span>
              </div>

              {item.categoryValue && (
                <span className="inline-block px-2 py-1 text-[8px] font-extrabold uppercase bg-brand-black text-white font-mono tracking-widest leading-none">
                  {item.categoryValue}
                </span>
              )}

              <h4 className="text-xl font-bold uppercase tracking-tight leading-tight group-hover:text-brand-red transition-colors line-clamp-3">
                {item.title}
              </h4>
              
              <p className="text-xs text-brand-black font-sans not-italic font-semibold line-clamp-4 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2 mt-6">
              {item.studentName && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 uppercase font-mono">Creador:</span>
                  <span className="font-bold text-brand-black text-right line-clamp-1">{item.studentName} {item.year ? `(${item.year})` : ''}</span>
                </div>
              )}
              {item.teacherName && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 uppercase font-mono">Prof.:</span>
                  <span className="font-bold text-brand-black text-right line-clamp-1">{item.teacherName}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[10px] text-brand-red font-bold uppercase tracking-wider pt-2 group-hover:underline">
                <span>Ver Publicación</span>
                <span>→</span>
              </div>
            </div>
          </div>
        ))}
      </RetroCarousel>
    </div>
  );
}
