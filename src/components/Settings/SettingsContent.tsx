"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tag {
  value: string;
  label: string;
}

interface User {
  name: string;
  interestTags: string[];
  aiPrompt: string;
  emailScheduleDays: string[];
  emailScheduleTime: string;
  isSubscribed: boolean;
}

interface TagsResponse {
  tags: string[];
}

const fetchUser = async (): Promise<User> => {
  const response = await fetch('/api/user');
  if (!response.ok) throw new Error('사용자 데이터를 불러오는데 실패했습니다.');
  const userData = await response.json();
  return {
    ...userData,
  };
};

const fetchTags = async (): Promise<TagsResponse> => {
  const response = await fetch('/api/tags');
  if (!response.ok) throw new Error('태그를 불러오는데 실패했습니다.');
  return response.json();
};

const updateUser = async (userData: Partial<User>): Promise<void> => {
  const response = await fetch('/api/user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('설정 저장에 실패했습니다.');
};

const daysOfWeek = [
  { value: 'mon', label: '월요일' },
  { value: 'tue', label: '화요일' },
  { value: 'wed', label: '수요일' },
  { value: 'thu', label: '목요일' },
  { value: 'fri', label: '금요일' },
  { value: 'sat', label: '토요일' },
  { value: 'sun', label: '일요일' },
];

const SortableTag = ({ tag, onRemove }: { tag: Tag; onRemove: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.value });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center px-3 py-1.5 rounded-full
        ${isDragging 
          ? 'bg-primary text-white shadow-lg' 
          : 'bg-gray-100 dark:bg-meta-4'
        }
        border border-gray-200 dark:border-strokedark
        touch-none
      `}
      {...attributes}
      {...listeners}
    >
      <span className="text-sm font-medium">{tag.label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
      >
        ×
      </button>
    </div>
  );
};

const TagSelector = ({ 
  selectedTags, 
  setSelectedTags,
  tagOptions 
}: {
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  tagOptions: Tag[];
}) => {
  const [showTagSelector, setShowTagSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSelectedTags((tags: Tag[]) => {
        const oldIndex = tags.findIndex((tag) => tag.value === active.id);
        const newIndex = tags.findIndex((tag) => tag.value === over.id);
        return arrayMove(tags, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="mb-5.5">
      <label
        className="mb-3 block text-sm font-medium text-black dark:text-white"
        htmlFor="keywords"
      >
        관심 주제
      </label>
      <div className="relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedTags.map(tag => tag.value)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-2 p-3 min-h-[60px] border border-gray-200 rounded-lg bg-white dark:bg-boxdark dark:border-strokedark">
              {selectedTags.map((tag) => (
                <SortableTag
                  key={tag.value}
                  tag={tag}
                  onRemove={() => {
                    setSelectedTags(selectedTags.filter(t => t.value !== tag.value));
                  }}
                />
              ))}
              
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  className="flex items-center px-3 py-1.5 rounded-full 
                    bg-slate-300 hover:bg-slate-200 
                    dark:bg-slate-700 dark:hover:bg-slate-600 
                    border border-slate-500 dark:border-slate-600 
                    transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">+ 태그 추가</span>
                </button>
                
                {showTagSelector && (
                  <div className="absolute top-full left-0 mt-1 w-48 py-1 bg-white dark:bg-boxdark border border-gray-200 dark:border-strokedark rounded-lg shadow-lg z-10">
                    {tagOptions
                      .filter(option => !selectedTags.find(tag => tag.value === option.value))
                      .map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedTags([...selectedTags, option]);
                            setShowTagSelector(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

const SettingsContent = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    refetchOnWindowFocus: false
  });
  const { data: tagsData, isLoading: isTagsLoading } = useQuery<TagsResponse>({
    queryKey: ['tags'],
    queryFn: fetchTags,
    refetchOnWindowFocus: false
  });

  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [emailScheduleDays, setEmailScheduleDays] = useState<string[]>([]);
  const [emailScheduleTime, setEmailScheduleTime] = useState('09:00');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSelectedTags(user.interestTags?.map(tag => ({ value: tag, label: tag })) || []);
      setAiPrompt(user.aiPrompt || '');
      setEmailScheduleDays(user.emailScheduleDays || []);
      setEmailScheduleTime(user.emailScheduleTime || '09:00');
      setIsSubscribed(user.isSubscribed || false);
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      alert('설정이 저장되었습니다.');
    },
    onError: () => {
      alert('설정 저장에 실패했습니다. 다시 시도해 주세요.');
    },
  });

  const sendImmediateEmailMutation = useMutation({
    mutationFn: () => axios.post('/api/email'),
    onSuccess: () => {
      alert('즉시 메일이 발송되었습니다.');
      setIsSending(false);
    },
    onError: () => {
      alert('메일 발송에 실패했습니다. 다시 시도해 주세요.');
      setIsSending(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateUserMutation.mutate({
      name,
      interestTags: selectedTags.map(tag => tag.value),
      aiPrompt,
      emailScheduleDays,
      emailScheduleTime,
      isSubscribed,
    });
  };

  const handleDayChange = (day: string) => {
    setEmailScheduleDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSendImmediateEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 폼 제출 방지
    setIsSending(true);
    sendImmediateEmailMutation.mutate();
  };

  if (isUserLoading || isTagsLoading) {
    return <div>로딩 중...</div>;
  }

  const tagOptions: Tag[] = tagsData?.tags.map(tag => ({ value: tag, label: tag })) || [];

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="설정" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-7">
          <form onSubmit={handleSubmit}>
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="name"
              >
                이름
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>
            <TagSelector 
              selectedTags={selectedTags} 
              setSelectedTags={setSelectedTags}
              tagOptions={tagOptions} 
            />
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
              >
                이메일 수신 요일
              </label>
              <div className="flex flex-wrap gap-4">
                {daysOfWeek.map((day) => (
                  <label key={day.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary"
                      checked={emailScheduleDays.includes(day.value)}
                      onChange={() => handleDayChange(day.value)}
                    />
                    <span className="ml-2 text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="emailScheduleTime"
              >
                이메일 수신 시각
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray-100 px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white cursor-not-allowed"
                type="time"
                name="emailScheduleTime"
                id="emailScheduleTime"
                value="08:00"
                disabled
              />
            </div>
            <div className="mb-5.5">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary"
                  name="isSubscribed"
                  id="isSubscribed"
                  checked={isSubscribed}
                  onChange={(e) => setIsSubscribed(e.target.checked)}
                />
                <span className="ml-2 text-sm font-medium text-black dark:text-white">
                  이메일 발송 활성화
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-4.5">
              <button
                className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                type="submit"
              >
                저장
              </button>
              <button
                className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSendImmediateEmail}
                disabled={!isSubscribed || isSending}
              >
                {isSending ? '발송 중...' : '즉시 발송'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
