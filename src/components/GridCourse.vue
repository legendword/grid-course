<template>
    <div>
        
    </div>
</template>

<script>
import { generateTables } from "../util/GridCourse";
export default {
    name: "GridCourse",
    props: {
        courses: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            tables: generateTables(this.courses),
        }
    },
    mounted() {
        console.log(this.tables);
    }
}
</script>

<style>

</style>