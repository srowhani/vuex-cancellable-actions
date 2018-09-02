import { Vue, Component } from 'vue-property-decorator';

@Component({
  template: `
    <div class='home-page'>
      <button @click='addTask'> Add Tasks</button>
      <div v-for='task in tasks'>
        <span :class="{'is-cancelled': task.cancelled, 'is-finished': task.finished }">
          Status: {{task.finished ? 'Finished' : task.cancelled ? 'Cancelled' : 'Running'}}
        </span>
      </div>
    </div>
  `
})
export default class HomePage extends Vue {
  addTask () {
    this.$store.dispatch('addTask');
  }
  get tasks () {
    return this.$store.state.tasks;
  }
}