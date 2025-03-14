---
title: I did a thing... PyroGist 👨🏽‍💻
date: "2020-03-05"
snippet: 'Spotlight: PyroGist - DEPRECATED'
---

<InfoBox type="warn">
<strong>DEPRECATED:</strong> This Project is no longer being maintained and has now be deprecated
</InfoBox>

As some of you might have heard, ProjectFunction is partnering up with NTU to deliver a 2 weeks intensive course. As with other PF courses we have run in the past, this one will be open to those who are under-represented in the industry. As part of this programme, learners will have the opportunity to take part in workshops and attend talks related to working in tech. Additionally, they will have the opportunity to apply all the skills they gather and the knowledge they gain, to design and implement their own website.

In preparation for this, I have started writing up some documentation and tasks for the learners. While doing the documentation for this, I came across 2 issues; firstly, there was no way to natively embed non-gist GitHub code into webpages, and secondly the option provided by GitHub does not make it difficult, if not impossible to restyle.

As it currently stands, GitHub allows you to embed gists into your webpage using the _embed_ option. But this comes in the form of a `<script>` tag that you insert into the page. This makes embedding simple, but at the cost of interface customizations. So I made my own. Now I know there are other solutions out there such as [_gist-it_](https://github.com/robertkrimen/gist-it) but I thought it would be a good challenge to implement my own.

My main priority when creating this was simplicity and customizability. I wanted the library to be easy to use, but also provide some customization options. Furthermore, I wanted to keep the element in the light DOM (outside of the shadow DOM) to ensure users could go even further with their customizations by using custom CSS.

Here is what I ended up creating:

![Screenshot of PyroGist in use](/images/PyroGist_Example_Screenshot.png)

As pictured above, the result allows the user to match the style of the embedded content to fit their page design. In order to use the library, you first have to link the stylesheet and put the script in the `<head>` of the destination document. Once you have this, PyroGist can be initialized.

<link rel="stylesheet" href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.0/build/styles/github.min.css">
<script src="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.0/build/highlight.min.js"></script>

<link rel="stylesheet" href="//darylcecile.net/scripts/PyroGist_v1/PyroGist.css">
<script src="//darylcecile.net/scripts/PyroGist_v1/PyroGist.js"></script>

<div id="preview">
PyroGist("#preview",{
    url: "https://github.com/daryl-cecile/MiniTest-1/blob/master/test.js",
    theme: "normal",
    autoFit: true,
    highlight: true
});
</div>

The example above shows how to embed a simple mock test file from a GitHub repository. If you wish to embed custom content (not hosted on GitHub), you can put the content directly into the body of the containing element and ignore the 'url' option.

<div id="preview2">
PyroGist("#preview2",{
    name: "My custom file",
    theme: "normal",
    autoFit: true,
    highlight: true
});
</div>

Currently, the highlighting is done by the highlightjs library (which users have to link themselves if they want syntax highlighting). However, the default colors can be easily overridden using custom CSS.

<script>
PyroGist("#preview",{
    name: "test.js",
    theme: "normal",
    autoFit: true,
    highlight: true
});
    
PyroGist("#preview2",{
    name: "example",
    theme: "normal",
    autoFit: true,
    highlight: true
});

console.log('Loaded PyroGist instances');
</script>

Even though this library has a long way to go, I feel fairly comfident that it has met my initial goals and can serve its original purpose. In the near future, I intend to make GitHub gists embeddable via url. Additionally, I may create an adapter or customElement to automatically load the previews directly from markup (something like `<pyro-gist url="/file/example.js"></pyro-gist>`).


Until then... ✌🏽

--

_P.S. This library can be found [here](https://github.com/daryl-cecile/PyroGist), on my GitHub account!_
