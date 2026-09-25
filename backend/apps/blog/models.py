from django.db import models

class BlogPost(models.Model):
    slug = models.SlugField(unique=True, db_index=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    cover_image = models.CharField(max_length=500, null=True, blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
