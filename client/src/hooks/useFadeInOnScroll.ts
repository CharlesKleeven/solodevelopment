import { useEffect } from 'react';

const useFadeInOnScroll = (deps: any[] = []) => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('[data-fade]');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, deps);
};

export default useFadeInOnScroll;
