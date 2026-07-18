// Static safety content. Sources: Health Canada wildfire-smoke guidance,
// GetPrepared.ca, ECCC AQHI program.

export const SAFETY_TITLE = 'Wildfire & smoke safety'

export const SAFETY_HTML = `
<div class="safety">
  <section>
    <h3>If smoke is in your air</h3>
    <ul>
      <li><strong>Stay indoors</strong> with windows and doors closed when smoke is heavy.</li>
      <li>Run a <strong>HEPA air cleaner</strong> or set your furnace fan to recirculate with a good filter (MERV 13+). One clean room matters more than a whole clean house.</li>
      <li>If you must be outside, a <strong>well-fitted N95/KN95</strong> respirator filters smoke particles; cloth and surgical masks do not.</li>
      <li>Drink water, skip strenuous activity, and check on neighbours who are older, pregnant, very young, or have heart/lung conditions.</li>
      <li>Feeling chest pain, severe shortness of breath, or dizziness? <strong>Call 911.</strong></li>
    </ul>
  </section>

  <section>
    <h3>Understand the AQHI</h3>
    <table class="safety__aqhi">
      <thead><tr><th scope="col">AQHI</th><th scope="col">Risk</th><th scope="col">What to do</th></tr></thead>
      <tbody>
        <tr><td>1–3</td><td>Low</td><td>Usual activities are fine.</td></tr>
        <tr><td>4–6</td><td>Moderate</td><td>At-risk people ease off strenuous outdoor activity.</td></tr>
        <tr><td>7–10</td><td>High</td><td>Everyone reduces outdoor exertion; at-risk people stay in.</td></tr>
        <tr><td>10+</td><td>Very high</td><td>Avoid outdoor activity; stay indoors with filtered air.</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h3>Evacuation: alert vs. order</h3>
    <ul>
      <li><strong>Evacuation alert</strong> — be ready to leave on short notice. Pack, fuel the car, plan where you'll go.</li>
      <li><strong>Evacuation order</strong> — leave now, by the routes officials give. Do not wait to see the fire.</li>
    </ul>
    <p>Alerts and orders come from your <strong>province, territory, or local government</strong> — not from this map. Register for their alert service today.</p>
  </section>

  <section>
    <h3>Grab-and-go basics</h3>
    <p>Water and snacks, medications and prescriptions, ID and key documents, phone and charger, glasses, cash, pet supplies, N95s, and clothes for a few days. Keep it by the door during fire season.</p>
  </section>

  <section>
    <h3>Official sources</h3>
    <ul class="safety__links">
      <li><a href="https://www.getprepared.gc.ca/cnt/hzd/wldfrs-en.aspx" target="_blank" rel="noopener">GetPrepared.ca — wildfires</a></li>
      <li><a href="https://cwfis.cfs.nrcan.gc.ca/interactive-map" target="_blank" rel="noopener">CWFIS interactive map (Natural Resources Canada)</a></li>
      <li><a href="https://firesmoke.ca/forecasts/current/" target="_blank" rel="noopener">FireSmoke.ca smoke forecast</a></li>
      <li><a href="https://weather.gc.ca/airquality/pages/index_e.html" target="_blank" rel="noopener">ECCC Air Quality Health Index</a></li>
      <li><a href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status" target="_blank" rel="noopener">BC Wildfire Service</a></li>
      <li><a href="https://www.alberta.ca/wildfire-status" target="_blank" rel="noopener">Alberta Wildfire</a></li>
      <li><a href="https://www.ontario.ca/page/forest-fires" target="_blank" rel="noopener">Ontario forest fires</a></li>
      <li><a href="https://sopfeu.qc.ca/en/" target="_blank" rel="noopener">SOPFEU (Québec)</a></li>
    </ul>
  </section>
</div>`
