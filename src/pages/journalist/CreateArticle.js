import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';
import { createArticle, uploadMedia } from '../../api/articles';
import { Box, Button, TextField, Typography, Container, Alert, Chip, Stack, Grid, Card, CardContent } from '@mui/material';

const CreateArticle = () => {
    const [formData, setFormData] = useState({
        id: '',
        headline: '',
        summary: '',
        content: '',
        tags: [],
        sources: []
    });
    const [tagInput, setTagInput] = useState('');
    const [sourceInput, setSourceInput] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagAdd = () => {
        if (tagInput && !formData.tags.includes(tagInput)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput] }));
            setTagInput('');
        }
    };

    const handleTagDelete = (tagToDelete) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToDelete)
        }));
    };

    const handleSourceAdd = () => {
        if (sourceInput && !formData.sources.includes(sourceInput)) {
            setFormData(prev => ({ ...prev, sources: [...prev.sources, sourceInput] }));
            setSourceInput('');
        }
    };

    const handleSourceDelete = (sourceToDelete) => {
        setFormData(prev => ({
            ...prev,
            sources: prev.sources.filter(source => source !== sourceToDelete)
        }));
    };

    const handleFileChange = (e) => {
        setMediaFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isAuthenticated) {
            setError('You must be logged in to create an article');
            return;
        }

        try {
            setLoading(true);
            const articleData = {
                ...formData,
                journalistId: user.id
            };

            // Create the article
            const createdArticle = await createArticle(articleData, localStorage.getItem('token'));

            // Upload media files if any
            if (mediaFiles.length > 0) {
                await uploadMedia(createdArticle.id, mediaFiles, 'MEDIA', localStorage.getItem('token'));
            }

            setSuccess('Article created successfully!');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error('Article creation error:', err);
            setError(err.response?.data?.message || 'Failed to create article');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
                Create New Article
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Grid container spacing={4} alignItems="flex-start" width="100%">
                {/* Left: Article Form */}
                <Grid item xs={12} md={7}>
                    <Box component="form" onSubmit={handleSubmit} sx={{ background: '#fff', p: 3, borderRadius: 2, boxShadow: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="ID"
                            name="id"
                            value={formData.id}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Headline"
                            name="headline"
                            value={formData.headline}
                            onChange={handleChange}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Summary"
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            multiline
                            rows={3}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            multiline
                            rows={10}
                        />

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Tags</Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                {formData.tags.map(tag => (
                                    <Chip key={tag} label={tag} onDelete={() => handleTagDelete(tag)} />
                                ))}
                            </Stack>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Add Tag"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                />
                                <Button variant="outlined" onClick={handleTagAdd}>
                                    Add
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Sources</Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                {formData.sources.map(source => (
                                    <Chip key={source} label={source} onDelete={() => handleSourceDelete(source)} />
                                ))}
                            </Stack>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Add Source"
                                    value={sourceInput}
                                    onChange={(e) => setSourceInput(e.target.value)}
                                />
                                <Button variant="outlined" onClick={handleSourceAdd}>
                                    Add
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Media Files</Typography>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                accept="image/*,video/*"
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Creating Article...' : 'Create Article'}
                        </Button>
                    </Box>
                </Grid>

                {/* Right: AI Section */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Use AI to Write for you
                            </Typography>
                            <TextField
                                label="Describe what you want (e.g. topic, style)"
                                multiline
                                rows={6}
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 2 }}
                            />
                            <Button variant="contained" color="primary" fullWidth>
                                Generate By AI
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CreateArticle;