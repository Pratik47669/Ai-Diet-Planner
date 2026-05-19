import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';

export const useDiet = () => {
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [currentPlan, setCurrentPlan] = useState(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/diet/history');
            setPlans(response.data.plans);
        } catch (error) {
            toast.error('Failed to fetch diet history');
        } finally {
            setLoading(false);
        }
    };

    const generatePlan = async () => {
        try {
            setLoading(true);
            const response = await api.post('/diet/generate');
            setCurrentPlan(response.data.plan);
            toast.success('Diet plan generated successfully!');
            return response.data.plan;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate plan');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deletePlan = async (planId) => {
        try {
            await api.delete(`/diet/${planId}`);
            setPlans(prev => prev.filter(p => p._id !== planId));
            toast.success('Plan deleted successfully');
        } catch (error) {
            toast.error('Failed to delete plan');
            throw error;
        }
    };

    const toggleFavorite = async (planId) => {
        try {
            const response = await api.patch(`/diet/${planId}/favorite`);
            setPlans(prev => prev.map(p => 
                p._id === planId ? { ...p, isFavorite: response.data.isFavorite } : p
            ));
            return response.data.isFavorite;
        } catch (error) {
            toast.error('Failed to update favorite');
            throw error;
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return {
        loading,
        plans,
        currentPlan,
        generatePlan,
        deletePlan,
        toggleFavorite,
        refreshHistory: fetchHistory
    };
};

export default useDiet;