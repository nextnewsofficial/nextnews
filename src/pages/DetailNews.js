// src/pages/DetailNews.js
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Alert, Box, Button, CircularProgress, Container, Divider, Link, Paper, Typography} from '@mui/material';
import {Helmet} from 'react-helmet';
import {API_BASE_URL} from '../config/constants';

const DetailNews = () => {
    const {id} = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await axios.get(`${API_BASE_URL}/public/v1/articles/home`, {
                    params: {
                        id: id,
                        published: true,
                        sortBy: 'publishDate',
                        sortOrder: 'DESC'
                    }
                });

                if (response.data.content && response.data.content.length > 0) {
                    setArticle(response.data.content[0]);
                } else {
                    setError('Article not found');
                }
            } catch (err) {
                setError('Failed to load article. Please try again later.');
                console.error('Error fetching article:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    if (loading) {
        return (
            <Container maxWidth="md"
                       sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                <CircularProgress size={60}/>
            </Container>
        );
    }

    return (
        <>
            {/* SEO Meta Tags */}
            {article && (
                <Helmet>
                    <title>{article.headline} | News Portal</title>
                    <meta name="description" content={article.summary}/>
                    <meta name="keywords" content={article.tags ? article.tags.join(', ') : ''}/>
                    <link rel="canonical" href={`https://your-news-portal.com/article/${article.id}`}/>

                    {/* Open Graph / Facebook */}
                    <meta property="og:type" content="article"/>
                    <meta property="og:title" content={article.headline}/>
                    <meta property="og:description" content={article.summary}/>
                    <meta property="og:url" content={`https://your-news-portal.com/article/${article.id}`}/>
                    {article.media && article.media.length > 0 && (
                        <meta property="og:image" content={article.media[0]}/>
                    )}

                    {/* Twitter */}
                    <meta name="twitter:card" content="summary_large_image"/>
                    <meta name="twitter:title" content={article.headline}/>
                    <meta name="twitter:description" content={article.summary}/>
                    {article.media && article.media.length > 0 && (
                        <meta name="twitter:image" content={article.media[0]}/>
                    )}

                    {/* Structured Data */}
                    <script type="application/ld+json">
                        {`{
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": "${article.headline}",
              "description": "${article.summary}",
              "datePublished": "${new Date(article.publishDate).toISOString()}",
              "image": ${article.media && article.media.length > 0 ?
                            `["${article.media[0]}"]` : '[]'
                        },
              "author": {
                "@type": "Organization",
                "name": "News Portal"
              },
              "publisher": {
                "@type": "Organization",
                "name": "News Portal",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://your-news-portal.com/logo.png"
                }
              }
            }`}
                    </script>
                </Helmet>
            )}

            <Container maxWidth="md" sx={{py: 4}}>
                {/* Google AdSense Header Ad */}
                <Box sx={{mb: 4, textAlign: 'center'}}>
                    <ins className="adsbygoogle"
                         style={{display: 'block'}}
                         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                         data-ad-slot="1234567890"
                         data-ad-format="auto"
                         data-full-width-responsive="true"
                    ></ins>
                </Box>

                {error ? (
                    <Alert severity="error" sx={{mb: 4}}>{error}</Alert>
                ) : article ? (
                    <>
                        <Typography variant="h1" component="h1" sx={{
                            mb: 3,
                            fontSize: {xs: '2rem', sm: '2.5rem', md: '3rem'},
                            fontWeight: 'bold',
                            lineHeight: 1.2
                        }}>
                            {article.headline}
                        </Typography>

                        <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                            <Typography variant="subtitle1" sx={{color: '#757575'}}>
                                Published on: {new Date(article.publishDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            </Typography>
                            <Box sx={{flexGrow: 1}}/>
                            <Button
                                variant="outlined"
                                onClick={() => window.print()}
                                sx={{mr: 1}}
                            >
                                Print
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }}
                            >
                                Share
                            </Button>
                        </Box>

                        {article.media && article.media.length > 0 && (
                            <Box sx={{mb: 4, textAlign: 'center'}}>
                                <img
                                    src={article.media[0]}
                                    alt={article.headline}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '500px',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Typography variant="caption" sx={{display: 'block', mt: 1, color: '#757575'}}>
                                    {article.mediaCaption || 'Image related to the article'}
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{mb: 4}}>
                            <Typography variant="h2" component="h2" sx={{
                                mb: 3,
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                Summary
                            </Typography>
                            <Typography variant="body1" sx={{
                                fontSize: '1.1rem',
                                lineHeight: 1.7,
                                mb: 3
                            }}>
                                {article.summary}
                            </Typography>
                        </Box>

                        <Divider sx={{my: 4}}/>

                        <Box>
                            <Typography variant="h2" component="h2" sx={{
                                mb: 3,
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                Full Story
                            </Typography>
                            <Typography variant="body1" sx={{
                                fontSize: '1.1rem',
                                lineHeight: 1.7,
                                whiteSpace: 'pre-line'
                            }}>
                                {article.content}
                            </Typography>
                        </Box>

                        {article.tags && article.tags.length > 0 && (
                            <Box sx={{mt: 6}}>
                                <Typography variant="h3" component="h3" sx={{
                                    mb: 2,
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold'
                                }}>
                                    Related Topics:
                                </Typography>
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                    {article.tags.map(tag => (
                                        <Button
                                            key={tag}
                                            variant="outlined"
                                            size="small"
                                            component={Link}
                                            href={`/tag/${tag}`}
                                            sx={{textTransform: 'capitalize'}}
                                        >
                                            {tag}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Google AdSense Footer Ad */}
                        <Box sx={{mt: 6, mb: 4, textAlign: 'center'}}>
                            <ins className="adsbygoogle"
                                 style={{display: 'block'}}
                                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                                 data-ad-slot="0987654321"
                                 data-ad-format="auto"
                                 data-full-width-responsive="true"
                            ></ins>
                        </Box>
                    </>
                ) : (
                    <Paper sx={{p: 4, textAlign: 'center'}}>
                        <Typography variant="h5" sx={{mb: 3}}>
                            Article Not Found
                        </Typography>
                        <Typography variant="body1" sx={{mb: 3}}>
                            The article you're looking for doesn't exist or has been removed.
                        </Typography>
                        <Button
                            variant="contained"
                            href="/"
                            sx={{bgcolor: '#d32f2f', '&:hover': {bgcolor: '#b71c1c'}}}
                        >
                            Back to Home
                        </Button>
                    </Paper>
                )}
            </Container>
        </>
    );
};

export default DetailNews;