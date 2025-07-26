// src/pages/Home.js
import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper, TextField,
    Typography,
    Switch, FormControlLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {Helmet} from 'react-helmet';
import {API_BASE_URL} from '../config/constants';
import TopNavbar from '../components/layout/TopNavbar';

const Home = () => {
    const [featuredArticle, setFeaturedArticle] = useState(null);
    const [taggedArticles, setTaggedArticles] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [fullArticle, setFullArticle] = useState(null);
    const [articleLoading, setArticleLoading] = useState(false);
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('newspaper'); // 'newspaper' | 'content'

    // Ref to track if ads have been initialized
    const adsInitialized = useRef(false);

    // Popular tags to display
    const popularTags = ['politics', 'technology', 'science', 'entertainment', 'geopolitics', 'health'];

    // Fetch home page articles
    useEffect(() => {
        const fetchHomeArticles = async () => {
            try {
                setLoading(true);
                setError('');

                // Fetch featured article
                const featuredResponse = await axios.get(`${API_BASE_URL}/public/v1/articles/home`, {
                    params: {
                        pageNumber: 0,
                        published: true,
                        pageSize: 1,
                        sortBy: 'publishDate',
                        sortOrder: 'DESC'
                    }
                });

                if (featuredResponse.data.content && featuredResponse.data.content.length > 0) {
                    setFeaturedArticle(featuredResponse.data.content[0]);
                }

                // Fetch articles for popular tags
                const taggedArticlesData = {};

                for (const tag of popularTags) {
                    const tagResponse = await axios.get(`${API_BASE_URL}/public/v1/articles/home`, {
                        params: {
                            tags: tag,
                            published: true,
                            pageNumber: 0,
                            pageSize: 3,
                            sortBy: 'publishDate',
                            sortOrder: 'DESC'
                        }
                    });

                    if (tagResponse.data.content) {
                        taggedArticlesData[tag] = tagResponse.data.content;
                    }
                }

                setTaggedArticles(taggedArticlesData);
            } catch (err) {
                setError('Failed to load articles. Please try again later.');
                console.error('Error fetching articles:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeArticles();
    }, []);

    // Initialize Google Ads only once
    useEffect(() => {
        if (!adsInitialized.current) {
            const script = document.createElement('script');
            script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX";
            script.async = true;
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);

            script.onload = () => {
                window.adsbygoogle = window.adsbygoogle || [];
                adsInitialized.current = true;
            };
        }

        return () => {
            // Cleanup not needed as ads should persist
        };
    }, []);

    // Fetch full article content
    const fetchFullArticle = async (articleId) => {
        setArticleLoading(true);
        setFullArticle(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/public/v1/articles/home`, {
                params: {
                    id: articleId,
                    published: true,
                    sortBy: 'publishDate',
                    sortOrder: 'DESC'
                }
            });

            if (response.data.content && response.data.content.length > 0) {
                setFullArticle(response.data.content[0]);
            } else {
                setError('Article content not found');
            }
        } catch (err) {
            setError('Failed to load article content. Please try again.');
            console.error('Error fetching article:', err);
        } finally {
            setArticleLoading(false);
        }
    };

    const handleReadMore = (articleId) => {
        setOpenDialog(true);
        fetchFullArticle(articleId);
    };

    const handleTagClick = (tag) => {
        navigate(`/tag/${tag}`);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFullArticle(null);
    };

    if (loading) {
        return (
            <Container maxWidth="lg"
                       sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                <CircularProgress size={60} sx={{color: '#d32f2f'}}/>
            </Container>
        );
    }

    // Article Card for Newspaper View
    const ArticleCard = ({ article, tag, onReadMore }) => (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
            }
        }}>
            {article.media && article.media.length > 0 ? (
                <CardMedia
                    component="img"
                    height="200"
                    image={article.media[0]}
                    alt={article.headline}
                />
            ) : (
                <Box sx={{
                    height: 200,
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography variant="body1" sx={{color: '#757575'}}>No Image</Typography>
                </Box>
            )}
            <CardContent sx={{flexGrow: 1}}>
                <Typography gutterBottom variant="h6" component="h3" sx={{fontWeight: 'bold'}}>
                    {article.headline}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                    {article.summary}
                </Typography>
            </CardContent>
            <Box sx={{p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Chip
                    label={tag}
                    size="small"
                    sx={{bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 'bold'}}
                />
                <Box sx={{display: 'flex', gap: 1}}>
                    <Button size="small" sx={{color: '#d32f2f', fontWeight: 'bold'}} onClick={() => onReadMore(article.id)}>
                        Read More
                    </Button>
                    <Button size="small" sx={{color: '#d32f2f', fontWeight: 'bold'}} href={`/article/${article.id}`} target="_blank" rel="noopener noreferrer">
                        In Details
                    </Button>
                </Box>
            </Box>
        </Card>
    );

    // Article Feed Item for Content View
    const ArticleFeedItem = ({ article, tag, onReadMore }) => (
        <Paper sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            gap: 3,
            alignItems: 'flex-start',
            bgcolor: '#fff',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }
        }}>
            {article.media && article.media.length > 0 ? (
                <Box sx={{minWidth: 120, maxWidth: 120, height: 80, mr: 2, flexShrink: 0}}>
                    <img src={article.media[0]} alt={article.headline} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8}} />
                </Box>
            ) : null}
            <Box sx={{flex: 1}}>
                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 1}}>{article.headline}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>{article.summary}</Typography>
                {article.content && (
                    <Typography variant="body2" sx={{mb: 1, color: '#444', whiteSpace: 'pre-line'}}>
                        {article.content.length > 300 ? article.content.slice(0, 300) + '...' : article.content}
                    </Typography>
                )}
                <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1}}>
                    {article.tags && article.tags.map(tagItem => (
                        <Chip key={tagItem} label={tagItem} size="small" sx={{bgcolor: '#ffebee', color: '#d32f2f'}} />
                    ))}
                </Box>
                <Box sx={{display: 'flex', gap: 1}}>
                    <Button size="small" variant="text" sx={{color: '#d32f2f', fontWeight: 'bold'}} onClick={() => onReadMore(article.id)}>
                        Read More
                    </Button>
                    <Button size="small" variant="text" sx={{color: '#d32f2f', fontWeight: 'bold'}} href={`/article/${article.id}`} target="_blank" rel="noopener noreferrer">
                        In Details
                    </Button>
                </Box>
            </Box>
        </Paper>
    );

    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>Breaking News, Latest Updates & Top Stories | News Portal</title>
                <meta name="description"
                      content="Stay informed with the latest news, breaking stories, and in-depth coverage of politics, technology, science, entertainment, and more."/>
                <meta name="keywords"
                      content="news, breaking news, latest news, politics, technology, science, entertainment, geopolitics, health"/>
                <link rel="canonical" href="https://your-news-portal.com/"/>

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website"/>
                <meta property="og:title" content="Breaking News & Latest Updates | News Portal"/>
                <meta property="og:description"
                      content="Get the latest news, breaking stories, and in-depth coverage of all important events."/>
                <meta property="og:url" content="https://your-news-portal.com/"/>
                {featuredArticle && featuredArticle.media && featuredArticle.media.length > 0 && (
                    <meta property="og:image" content={featuredArticle.media[0]}/>
                )}

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content="Breaking News & Latest Updates | News Portal"/>
                <meta name="twitter:description"
                      content="Stay informed with the latest news, breaking stories, and in-depth coverage."/>
                {featuredArticle && featuredArticle.media && featuredArticle.media.length > 0 && (
                    <meta name="twitter:image" content={featuredArticle.media[0]}/>
                )}

                {/* Structured Data */}
                <script type="application/ld+json">
                    {`{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "News Portal",
            "url": "https://your-news-portal.com/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://your-news-portal.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }`}
                </script>
            </Helmet>

            <Container maxWidth="lg" sx={{py: 4}}>
                {/* Top Navbar */}
                <TopNavbar />
                {/* View Mode Switch */}
                <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3}}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={viewMode === 'content'}
                                onChange={e => setViewMode(e.target.checked ? 'content' : 'newspaper')}
                                color="primary"
                            />
                        }
                        label={viewMode === 'content' ? 'Content View' : 'Newspaper View'}
                        sx={{fontWeight: 'bold'}}
                    />
                </Box>

                {/* Leaderboard Ad (Top of Page) */}
                <Box sx={{mb: 4, textAlign: 'center'}}>
                    <ins className="adsbygoogle"
                         style={{display: 'block'}}
                         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                         data-ad-slot="1234567890"
                         data-ad-format="auto"
                         data-full-width-responsive="true"
                    ></ins>
                </Box>

                {/* Featured Article (only in Newspaper View) */}
                {viewMode === 'newspaper' && featuredArticle && (
                    <Box sx={{mb: 6, position: 'relative'}}>
                        {featuredArticle.media && featuredArticle.media.length > 0 ? (
                            <CardMedia
                                component="img"
                                height="500"
                                image={featuredArticle.media[0]}
                                alt={featuredArticle.headline}
                                sx={{borderRadius: 2}}
                            />
                        ) : (
                            <Box sx={{
                                height: 500,
                                bgcolor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 2
                            }}>
                                <Typography variant="h6" sx={{color: '#757575'}}>No Image Available</Typography>
                            </Box>
                        )}
                        <Paper sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 4,
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            borderTop: '4px solid #d32f2f',
                            borderRadius: '0 0 8px 8px'
                        }}>
                            <Typography variant="h3" component="h1" sx={{color: 'white', mb: 2}}>
                                {featuredArticle.headline}
                            </Typography>
                            <Typography variant="h6" sx={{color: 'rgba(255, 255, 255, 0.8)', mb: 3}}>
                                {featuredArticle.summary}
                            </Typography>
                            <Box sx={{display: 'flex', gap: 2}}>
                                <Button
                                    variant="contained"
                                    sx={{bgcolor: '#d32f2f', '&:hover': {bgcolor: '#b71c1c'}}}
                                    onClick={() => handleReadMore(featuredArticle.id)}
                                >
                                    Read Full Story
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{color: 'white', borderColor: 'white'}}
                                    href={`/article/${featuredArticle.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    In Details
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                )}

                {error && <Alert severity="error" sx={{mb: 4}}>{error}</Alert>}

                {/* Popular Tags Section */}
                <Box sx={{mb: 4, textAlign: 'center'}}>
                    <Typography variant="h5" component="h2" sx={{mb: 2, fontWeight: 'bold', color: '#333'}}>
                        Browse by Category
                    </Typography>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1}}>
                        {popularTags.map(tag => (
                            <Chip
                                key={tag}
                                label={tag.charAt(0).toUpperCase() + tag.slice(1)}
                                onClick={() => handleTagClick(tag)}
                                sx={{
                                    bgcolor: '#f5f5f5',
                                    color: '#d32f2f',
                                    fontWeight: 'bold',
                                    px: 2,
                                    py: 1,
                                    fontSize: '1rem',
                                    '&:hover': {
                                        bgcolor: '#ffebee',
                                        cursor: 'pointer'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* In-Feed Ad (After Popular Tags) */}
                <Box sx={{mb: 4, textAlign: 'center'}}>
                    <ins className="adsbygoogle"
                         style={{display: 'block'}}
                         data-ad-format="fluid"
                         data-ad-layout-key="-fb+5w+4e-db+86"
                         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                         data-ad-slot="2345678901"
                    ></ins>
                </Box>

                {/* Main Content: Newspaper or Content View */}
                {viewMode === 'newspaper' ? (
                    // Newspaper: grid by tag
                    Object.keys(taggedArticles).map((tag, index) => (
                        <React.Fragment key={tag}>
                            <Box sx={{mb: 6}}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 3,
                                    borderBottom: '2px solid #d32f2f',
                                    pb: 1
                                }}>
                                    <Typography variant="h4" component="h2" sx={{fontWeight: 'bold', color: '#333'}}>
                                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </Typography>
                                    <Button
                                        variant="text"
                                        sx={{color: '#d32f2f', fontWeight: 'bold'}}
                                        onClick={() => handleTagClick(tag)}
                                    >
                                        View All
                                    </Button>
                                </Box>
                                <Grid container spacing={4}>
                                    {taggedArticles[tag].map((article) => (
                                        <Grid item xs={12} md={6} lg={4} key={article.id}>
                                            <ArticleCard article={article} tag={tag} onReadMore={handleReadMore} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                            {/* Insert ad after every 2 sections */}
                            {(index + 1) % 2 === 0 && (
                                <Box sx={{mb: 4, textAlign: 'center'}}>
                                    <ins className="adsbygoogle"
                                         style={{display: 'block'}}
                                         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                                         data-ad-slot="3456789012"
                                         data-ad-format="auto"
                                         data-full-width-responsive="true"
                                    ></ins>
                                </Box>
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    // Content: single-column feed
                    <Box sx={{maxWidth: 700, mx: 'auto'}}>
                        {Object.keys(taggedArticles).map(tag => (
                            taggedArticles[tag].map(article => (
                                <ArticleFeedItem key={article.id} article={article} tag={tag} onReadMore={handleReadMore} />
                            ))
                        ))}
                    </Box>
                )}

                {/* Newsletter Subscription */}
                <Paper sx={{p: 4, mb: 6, bgcolor: '#fff5f6', borderRadius: 2, textAlign: 'center'}}>
                    <Typography variant="h5" component="h3" sx={{mb: 2, fontWeight: 'bold', color: '#d32f2f'}}>
                        Stay Updated with Our Newsletter
                    </Typography>
                    <Typography variant="body1" sx={{mb: 3, maxWidth: 600, mx: 'auto'}}>
                        Get the latest news and updates delivered directly to your inbox. No spam, just quality journalism.
                    </Typography>
                    <Box sx={{display: 'flex', justifyContent: 'center', gap: 2}}>
                        <TextField
                            variant="outlined"
                            placeholder="Your email address"
                            size="small"
                            sx={{
                                width: 300,
                                bgcolor: 'white',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {borderColor: '#d32f2f'},
                                    '&:hover fieldset': {borderColor: '#b71c1c'}
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{bgcolor: '#d32f2f', '&:hover': {bgcolor: '#b71c1c'}}}
                        >
                            Subscribe
                        </Button>
                    </Box>
                </Paper>

                {/* Bottom Leaderboard Ad */}
                <Box sx={{mb: 4, textAlign: 'center'}}>
                    <ins className="adsbygoogle"
                         style={{display: 'block'}}
                         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                         data-ad-slot="4567890123"
                         data-ad-format="auto"
                         data-full-width-responsive="true"
                    ></ins>
                </Box>
            </Container>

            {/* Article Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
                PaperProps={{sx: {borderRadius: 2}}}
            >
                <DialogTitle sx={{
                    bgcolor: '#d32f2f',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h5" sx={{fontWeight: 'bold'}}>
                        {fullArticle?.headline}
                    </Typography>
                    <IconButton onClick={handleCloseDialog} sx={{color: 'white'}}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    {articleLoading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                            <CircularProgress sx={{color: '#d32f2f'}}/>
                        </Box>
                    ) : fullArticle ? (
                        <>
                            {fullArticle.media && fullArticle.media.length > 0 && (
                                <Box sx={{mb: 3, textAlign: 'center'}}>
                                    <img
                                        src={fullArticle.media[0]}
                                        alt={fullArticle.headline}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '400px',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </Box>
                            )}

                            <Typography variant="subtitle1" sx={{
                                mb: 3,
                                fontStyle: 'italic',
                                color: '#666'
                            }}>
                                Published on: {new Date(fullArticle.publishDate).toLocaleDateString()}
                            </Typography>

                            <Box sx={{mb: 3}}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 1}}>
                                    Summary
                                </Typography>
                                <Typography variant="body1" sx={{mb: 2}}>
                                    {fullArticle.summary}
                                </Typography>
                            </Box>

                            <Divider sx={{my: 3}}/>

                            <Box>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2}}>
                                    Full Content
                                </Typography>
                                <Typography variant="body1" sx={{whiteSpace: 'pre-line'}}>
                                    {fullArticle.content}
                                </Typography>
                            </Box>

                            {fullArticle.tags && fullArticle.tags.length > 0 && (
                                <Box sx={{mt: 4}}>
                                    <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 1}}>
                                        Tags:
                                    </Typography>
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                        {fullArticle.tags.map(tag => (
                                            <Chip
                                                key={tag}
                                                label={tag}
                                                onClick={() => handleTagClick(tag)}
                                                sx={{
                                                    bgcolor: '#ffebee',
                                                    color: '#d32f2f',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            <Box sx={{mt: 4, textAlign: 'center'}}>
                                <Button
                                    variant="contained"
                                    href={`/article/${fullArticle.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{bgcolor: '#d32f2f', '&:hover': {bgcolor: '#b71c1c'}}}
                                >
                                    View In Details Page
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Typography variant="body1" sx={{py: 4, textAlign: 'center'}}>
                            Article content could not be loaded.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Home;