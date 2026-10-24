'use client';

import React, { useState, useMemo } from 'react';
import { fullCourseData } from '@/lib/type';
import { getChennaiCourseType } from '@/lib/chennaiCatalog';
import chennaiCourses from '@/data/all_data_chennai';

type CourseOption = {
    slot?: string;
    faculty?: string;
    labSlot?: string;
    venue?: string;
    venueLab?: string;
};

type CourseCatalog = Record<string, Record<string, CourseOption[]>>;

interface CourseSelectorProps {
    scheme: string;
    onCourseSelect: (course: fullCourseData) => void;
    selectedCourses: fullCourseData[];
}

function parseChennaiCoursesNew(courses: typeof chennaiCourses): CourseCatalog {
    const chennaiCategoryData: CourseCatalog = {};
    for (let i = 0; i < courses.length; i++) {
        const record = courses[i];
        const category = record.TYPE?.trim() || 'UNKNOWN';
        const courseKey = `${record.CODE?.trim()} - ${record.TITLE?.trim()}`;

        chennaiCategoryData[category] ||= {};
        const options = (chennaiCategoryData[category][courseKey] ||= []);
        
        // De-duplicate same faculty + slot combinations and trim whitespace
        const isDuplicate = options.some(
            (opt) => opt.slot === record.SLOT && opt.faculty === record.FACULTY
        );
        if (!isDuplicate) {
            options.push({
                slot: record.SLOT?.trim(),
                faculty: record.FACULTY?.trim(),
                venue: (record as any).VENUE?.trim() || 'TBD',
            });
        }
    }
    return chennaiCategoryData;
}

export default function CourseSelector({
    scheme,
    onCourseSelect,
    selectedCourses,
}: CourseSelectorProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [schemeData, categories, courses] = useMemo(() => {
        if (scheme !== 'CHENNAI') {
            return [{} as CourseCatalog, [] as string[], {} as Record<string, CourseOption[]>];
        }

        const chennaiCategoryData = parseChennaiCoursesNew(chennaiCourses);

        const chennaiCategories = Object.keys(chennaiCategoryData);
        const chennaiAllCourses: Record<string, CourseOption[]> = {};

        chennaiCategories.forEach((category) => {
            Object.assign(chennaiAllCourses, chennaiCategoryData[category]);
        });

        return [chennaiCategoryData, chennaiCategories, chennaiAllCourses];
    }, [scheme]);

    const filteredCourses = useMemo(() => {
        let filtered = Object.entries(courses);

        if (selectedCategory) {
            const categoryData = schemeData[selectedCategory] || {};
            filtered = Object.entries(categoryData);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                ([courseCode]) =>
                    courseCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [selectedCategory, searchTerm, courses, schemeData]);

    const buildFullCourseData = (courseCode: string, courseOptions: CourseOption[]): fullCourseData => {
        // Extract course code and name from format like "BCSE202L - Data Structures and Algorithms"
        const [code, ...nameParts] = courseCode.split(' - ');
        const courseName = nameParts.join(' - ') || courseCode;
        
        // Determine course type
        const courseType = getChennaiCourseType(code);

        // Default to single slot per faculty if not provided
        const courseSlots = courseOptions.map((option) => ({
            slotName: option.slot || '',
            slotFaculties: [
                {
                    facultyName: option.faculty || '',
                    facultyLabSlot: option.labSlot,
                    venue: option.venue || 'TBD',
                    venueLab: option.venueLab,
                },
            ],
        }));

        return {
            id: courseCode,
            courseType,
            courseCode: code,
            courseName,
            courseSlots,
        };
    };

    const handleCourseSelect = (courseCode: string, courseOptions: CourseOption[]) => {
        const fullData = buildFullCourseData(courseCode, courseOptions);
        onCourseSelect(fullData);
    };

    const isSelected = (courseCode: string) => {
        return selectedCourses.some(c => c.id === courseCode);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Step 2: Select Courses
                </h2>

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search courses by code (e.g., BCSE202L)..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Category Selector */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        Course Categories
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`p-2 rounded border text-sm font-medium transition-all ${
                                !selectedCategory
                                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                            }`}
                        >
                            All
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`p-2 rounded border text-sm font-medium transition-all ${
                                    selectedCategory === category
                                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Courses List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map(([courseCode, courseOptions]) => {
                            const [code] = courseCode.split(' - ');
                            return (
                                <div
                                    key={courseCode}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        isSelected(courseCode)
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-mono font-bold text-gray-800">
                                                {code}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {courseCode.split(' - ').slice(1).join(' - ')}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                {Array.isArray(courseOptions)
                                                    ? `${courseOptions.length} slot option(s)`
                                                    : 'No slots available'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleCourseSelect(courseCode, courseOptions)
                                            }
                                            className={`ml-4 px-4 py-2 rounded font-medium transition-all whitespace-nowrap ${
                                                isSelected(courseCode)
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                            }`}
                                        >
                                            {isSelected(courseCode) ? '✓ Added' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No courses found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
