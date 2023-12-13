---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

{% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}

* **EllipScape: A Genetic Algorithm Based Approach to Non-Photorealistic Colored Image Reconstruction for Evolutionary Art** - Soumil Datta, and Charles Walter. 57th Hawaii International Conference on System Sciences (HICSS), 2024 (Accepted and Forthcoming, Nominated for Best Paper in Track)