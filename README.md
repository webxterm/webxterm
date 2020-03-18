# webxterm
网页终端仿真器
<br/>
通过以下命令进行编译成浏览器可以使用的webxterm.js<br/>
<code>shell>> sh tr.sh</code>
<br/>
<br/>
<!-- 引入样式 -->
<pre><code><link rel="stylesheet" href="../css/terminal.css"/></code></pre>
<br/>
<!-- 引入组件 -->
<code><script type="text/javascript" src="../dist/webxterm.js"></script></code>
<br/>
<br/>
# Hello world
<pre>
<code>
<html>
  <body>
    <div id="test" style="width: 100vw; height: 100vh;"></div>
  </body>

<script type="text/javascript">
    let el = document.getElementById('test');
    let terminal = new webxterm.Terminal({
        instance: el,
        wsServer: "ws://192.168.0.100:8899",
        render: (args) => {
            console.info(args.instance);
        }<br/>
    }).on({<br/>
        resize: () => {
            console.info("resize....");
        },
        updateTitle: (title) => {
            document.title = title;
            console.info("updateTitle:" + title);
        }
    }).open('【主机名】','【用户名】', '【密码】',【端口号);
  </script>
  </html>
  </code>
  </pre>
