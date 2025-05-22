import { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { ICourse } from '@/models/Course';
import { motion } from 'framer-motion';

type CoursesListProps = {
  locale: string;
  category?: string;
  limit?: number;
}

// Временные данные для демонстрации
const demoCoursesData: ICourse[] = Array(6).fill(null).map((_, index) => ({
  _id: `demo-${index}`,
  title: { ru: `Демо курс ${index + 1}`, en: `Demo Course ${index + 1}` },
  slug: `demo-course-${index + 1}`,
  description: {
    ru: 'Это демонстрационный курс для отображения на странице.',
    en: 'This is a demo course for display purposes.'
  },
  category: ['Программирование', 'Дизайн', 'Маркетинг', 'Бизнес'][index % 4],
  price: 3900 + index * 1000,
  discount: index % 3 === 0 ? 15 : 0,
  coverImage: `/images/course-${(index % 3) + 1}.jpg`,
  lessons: Array(6 + index).fill(null).map((_, i) => ({
    title: `Урок ${i + 1}`,
    description: 'Описание урока',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 30 + i * 5,
    order: i + 1
  })),
  published: true,
  createdBy: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
} as unknown as ICourse));

export default function CoursesList({ locale, category, limit = 9 }: CoursesListProps) {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Имитация загрузки данных
        setLoading(true);
        
        // На этапе разработки используем демо-данные
        // В реальном приложении здесь будет запрос к API
        setTimeout(() => {
          let filteredCourses = [...demoCoursesData];
          
          if (category) {
            filteredCourses = filteredCourses.filter(
              course => course.category === category
            );
          }
          
          setCourses(filteredCourses.slice(0, limit));
          setLoading(false);
        }, 1000);
        
        // Код для реального API (раскомментировать позже)
        /*
        let url = `/api/courses?locale=${locale}&limit=${limit}`;
        if (category) {
          url += `&category=${encodeURIComponent(category)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        setCourses(data.courses);
        */
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Не удалось загрузить курсы. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, [locale, category, limit]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">{error}</p>
        <button className="btn-primary mt-4" onClick={() => window.location.reload()}>
          {locale === 'ru' ? 'Попробовать снова' : 'Try again'}
        </button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">
          {locale === 'ru' ? 'Курсы не найдены' : 'No courses found'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course, index) => (
        <CourseCard 
          key={typeof course._id === 'string' ? course._id : String(course._id)} 
          course={course} 
          locale={locale} 
          index={index} 
        />
      ))}
    </div>
  );
} 